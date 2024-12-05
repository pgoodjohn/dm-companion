import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { Button } from "./components/ui/button";
import { useForm } from "@tanstack/react-form";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


const NewCharacterDialog: React.FC = () => {



    return (
        <Dialog>
            <DialogTrigger>
                <Button>
                    New Character
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new World character</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to create a new character. All fields are mandatory.
                    </DialogDescription>
                </DialogHeader>
                <NewCharacterForm />
            </DialogContent>
        </Dialog>
    )
}

export default NewCharacterDialog;

import { ReactNode } from 'react';

interface NewCharacterFormFieldContainerProps {
    children: ReactNode;
}

const NewCharacterFormFieldContainer: React.FC<NewCharacterFormFieldContainerProps> = ({ children }) => {
    return (
        <div className="flex items-center py-2">
            {children}
        </div>
    )
}

const NewCharacterForm: React.FC = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async function (values: {
            name: string,
            class: string,
            race: string,
            background: string | null,
            level: number,
            experience: number,
            hit_points: number,
            armor_class: number,
            notes: string
        }) {
            let res = await invoke(
                'create_character_command',
                {
                    name: values.name,
                    class: values.class,
                    race: values.race,
                    background: values.background,
                    level: values.level,
                    experience: values.experience,
                    hitPoints: values.hit_points,
                    armorClass: values.armor_class,
                    notes: values.notes
                }
            )
            console.debug("Save Rust Returned", res)
            return res
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['characters'] })
            newCharacterForm.reset()
        },
    })

    const newCharacterForm = useForm({
        defaultValues: {
            name: '',
            class: '',
            race: '',
            background: '',
            level: 1,
            experience: 0,
            hit_points: 0,
            armor_class: 0,
            notes: ''
        },
        onSubmit: async (values) => {
            console.debug("Form Submitted", values)
            await mutation.mutateAsync(values.value)
        }
    })

    return (
        <div>
            <form
                className=""
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    newCharacterForm.handleSubmit()
                }}>
                <newCharacterForm.Field
                    name="name"
                    children={(field) => (
                        <NewCharacterFormFieldContainer>
                            <Label className="pr-2" htmlFor={field.name}>Name</Label>
                            <Input
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                placeholder="Name"
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </NewCharacterFormFieldContainer>
                    )}
                />
                <newCharacterForm.Field
                    name="class"
                    children={(field) => (
                        <NewCharacterFormFieldContainer>
                            <Label className="pr-2" htmlFor={field.name}>Class</Label>
                            <ClassesCombobox value={field.state.value} onChange={field.handleChange} />
                        </NewCharacterFormFieldContainer>
                    )}
                />
                <newCharacterForm.Field
                    name="race"
                    children={(field) => (
                        <NewCharacterFormFieldContainer>
                            <Label className="pr-2" htmlFor={field.name}>Race</Label>
                            <RacessCombobox value={field.state.value} onChange={field.handleChange} />
                        </NewCharacterFormFieldContainer>
                    )}
                />
                <newCharacterForm.Field
                    name="background"
                    children={(field) => (
                        <NewCharacterFormFieldContainer>
                            <Label className="pr-2" htmlFor={field.name}>Background</Label>
                            <Input
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                placeholder="Background"
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </NewCharacterFormFieldContainer>
                    )}
                />
                <newCharacterForm.Field
                    name="level"
                    children={(field) => (
                        <NewCharacterFormFieldContainer>
                            <Label className="pr-2" htmlFor={field.name}>Level</Label>
                            <Input
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                placeholder="Level"
                                type="number"
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                            />
                        </NewCharacterFormFieldContainer>
                    )}
                />
                <newCharacterForm.Field
                    name="experience"
                    children={(field) => (
                        <NewCharacterFormFieldContainer>
                            <Label className="pr-2" htmlFor={field.name}>Experience</Label>
                            <Input
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                placeholder="Experience"
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                            />
                        </NewCharacterFormFieldContainer>
                    )}
                />
                <newCharacterForm.Field
                    name="hit_points"
                    children={(field) => (
                        <NewCharacterFormFieldContainer>
                            <Label className="pr-2" htmlFor={field.name}>Hit Points</Label>
                            <Input
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                placeholder="Hit Points"
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                            />
                        </NewCharacterFormFieldContainer>
                    )}
                />
                <newCharacterForm.Field
                    name="armor_class"
                    children={(field) => (
                        <NewCharacterFormFieldContainer>
                            <Label className="pr-2" htmlFor={field.name}>Armor Class</Label>
                            <Input
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                placeholder="Armor Class"
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                            />
                        </NewCharacterFormFieldContainer>
                    )}
                />
                <newCharacterForm.Field
                    name="notes"
                    children={(field) => (
                        <NewCharacterFormFieldContainer>
                            <Label className="pr-2" htmlFor={field.name}>Notes</Label>
                            <Input
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                placeholder="Notes"
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </NewCharacterFormFieldContainer>
                    )}
                />
                <Button type="submit">Create Character</Button>
            </form >
        </div >
    )
}

const classes = [
    { value: 'Barbarian', label: 'Barbarian' },
    { value: 'Bard', label: 'Bard' },
    { value: 'Cleric', label: 'Cleric' },
    { value: 'Druid', label: 'Druid' },
    { value: 'Fighter', label: 'Fighter' },
    { value: 'Monk', label: 'Monk' },
    { value: 'Paladin', label: 'Paladin' },
    { value: 'Ranger', label: 'Ranger' },
    { value: 'Rogue', label: 'Rogue' },
    { value: 'Sorcerer', label: 'Sorcerer' },
    { value: 'Warlock', label: 'Warlock' },
    { value: 'Wizard', label: 'Wizard' },
]

interface ClassesComboboxProps {
    value: string
    onChange: (value: string) => void
}

const ClassesCombobox: React.FC<ClassesComboboxProps> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? classes.find((classChoice) => classChoice.value === value)?.label
                        : "Select class"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search class" />
                    <CommandList>
                        <CommandEmpty>No class found.</CommandEmpty>
                        <CommandGroup>
                            {classes.map((classChoice) => (
                                <CommandItem
                                    key={classChoice.value}
                                    value={classChoice.value}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === classChoice.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {classChoice.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

const races = [
    { value: 'Dragonborn', label: 'Dragonborn' },
    { value: 'Dwarf', label: 'Dwarf' },
    { value: 'Elf', label: 'Elf' },
    { value: 'Gnome', label: 'Gnome' },
    { value: 'Half-Elf', label: 'Half-Elf' },
    { value: 'Half-Orc', label: 'Half-Orc' },
    { value: 'Halfling', label: 'Halfling' },
    { value: 'Human', label: 'Human' },
    { value: 'Tiefling', label: 'Tiefling' },
]

interface RacesComboboxProps {
    value: string
    onChange: (value: string) => void
}

const RacessCombobox: React.FC<RacesComboboxProps> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? races.find((race) => race.value === value)?.label
                        : "Select race"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search class" />
                    <CommandList>
                        <CommandEmpty>No race found.</CommandEmpty>
                        <CommandGroup>
                            {races.map((race) => (
                                <CommandItem
                                    key={race.value}
                                    value={race.value}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === race.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {race.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}