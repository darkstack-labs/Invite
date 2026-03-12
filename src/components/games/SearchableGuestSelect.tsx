import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SearchableGuestSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SearchableGuestSelect = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
}: SearchableGuestSelectProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-gold text-sm font-medium">{label}</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between border-gold/30 bg-black/30 text-champagne hover:bg-gold/10 hover:text-gold"
          >
            <span className={cn("truncate", !value && "text-champagne/50")}>
              {value || placeholder}
            </span>

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[240px] border-gold/30 bg-black p-0 text-champagne">
          <Command className="bg-black text-champagne">
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              className="text-champagne placeholder:text-champagne/40"
            />

            <CommandList>
              <CommandEmpty className="text-champagne/60">
                No name found.
              </CommandEmpty>

              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    className="text-champagne data-[selected=true]:bg-gold/15 data-[selected=true]:text-gold"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchableGuestSelect;
