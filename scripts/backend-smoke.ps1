param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$EntryId = "2006"
)

$ErrorActionPreference = "Stop"

function Invoke-Test {
  param(
    [string]$Name,
    [scriptblock]$Action
  )

  try {
    $result = & $Action
    [PSCustomObject]@{ Test = $Name; Passed = $true; Detail = $result }
  } catch {
    [PSCustomObject]@{ Test = $Name; Passed = $false; Detail = $_.Exception.Message }
  }
}

$results = @()

$results += Invoke-Test -Name "login-invalid-format-400" -Action {
  try {
    Invoke-WebRequest -Method Post -Uri "$BaseUrl/api/login" -ContentType "application/json" -Body '{"entryId":"ab"}' | Out-Null
    throw "Expected HTTP 400"
  } catch {
    if ([int]$_.Exception.Response.StatusCode -ne 400) { throw $_ }
    "400"
  }
}

$results += Invoke-Test -Name "login-valid-200" -Action {
  $payload = @{ entryId = $EntryId } | ConvertTo-Json -Compress
  $res = Invoke-WebRequest -Method Post -Uri "$BaseUrl/api/login" -ContentType "application/json" -Body $payload
  if ([int]$res.StatusCode -ne 200) { throw "Expected 200" }
  $json = $res.Content | ConvertFrom-Json
  if (-not $json.token) { throw "Missing custom token" }
  "200 with token"
}

$results += Invoke-Test -Name "games-invalid-token-401" -Action {
  try {
    Invoke-WebRequest -Method Post -Uri "$BaseUrl/api/games" -Headers @{ Authorization = "Bearer invalid" } -ContentType "application/json" -Body '{"kind":"vote","collectionName":"MPM VOTES","selections":["Pahal"]}' | Out-Null
    throw "Expected HTTP 401"
  } catch {
    if ([int]$_.Exception.Response.StatusCode -ne 401) { throw $_ }
    "401"
  }
}

$results += Invoke-Test -Name "rsvp-invalid-token-401" -Action {
  try {
    Invoke-WebRequest -Method Post -Uri "$BaseUrl/api/rsvp" -Headers @{ Authorization = "Bearer invalid" } -ContentType "application/json" -Body '{"attendance":"yes","mealPreference":"veg"}' | Out-Null
    throw "Expected HTTP 401"
  } catch {
    if ([int]$_.Exception.Response.StatusCode -ne 401) { throw $_ }
    "401"
  }
}

$results | Format-Table -AutoSize

if ($results.Where({ -not $_.Passed }).Count -gt 0) {
  exit 1
}
