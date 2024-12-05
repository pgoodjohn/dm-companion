import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import RouteContainer from '@/components/route-container'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


export const Route = createFileRoute('/encounters/$encounterId')({
    component: RouteComponent,
})

function RouteComponent() {
    const { encounterId } = Route.useParams()
    return (
        <RouteContainer>
            <EncounterDetailScreen encounterId={encounterId} />
        </RouteContainer>
    )
}

interface EncounterDetailScreenProps {
    encounterId: string
}

const EncounterDetailScreen: React.FC<EncounterDetailScreenProps> = ({ encounterId }) => {

    const encounterDetailQuery = useQuery({
        queryKey: ['encounterDetail', encounterId],
        queryFn: async () => {
            let res = await invoke('load_encounter_detail_command', { encounterId: encounterId })
            console.debug("Rust Return get_encounter_detail_command", res)
            let data = JSON.parse(res as string)
            console.debug("Encounter Detail", data)
            return data
        }
    })

    if (encounterDetailQuery.isLoading) {
        // return <p>Loading...</p>
        return <></>
    }

    if (encounterDetailQuery.isError) {
        return <p>Error loading encounter detail</p>
    }

    if (encounterDetailQuery.data) {
        console.log(encounterDetailQuery.data)
    }
    return (
        <div>
            <div className='flex container items-center'>
                <h1>{encounterDetailQuery.data.encounter.encounter_title}</h1>
                <div className='flex-grow' />
                <AddEncounterCharacterDialog encounterId={encounterDetailQuery.data.encounter.id} />
            </div>
            <div className='flex'>
                <div className='container'>
                    {
                        encounterDetailQuery.data.characters.map((character: any) => {
                            return (
                                <div key={character.id} className=''>
                                    <p>{character.character.name} - {character.character.initiative}</p>
                                    <p>{character.character.current_hit_points} / {character.character.hit_points}</p>
                                </div>
                            )
                        })
                    }
                </div>
                <div>
                    <TurnOrder characters={encounterDetailQuery.data.characters} />
                </div>
            </div>
        </div>
    )
}

interface TrunOrderProps {
    characters: any[]
}

const TurnOrder: React.FC<TrunOrderProps> = ({ characters }) => {

    const sortedCharacters = characters.sort((a, b) => {
        return b.character.initiative - a.character.initiative
    })
    return (
        <div>
            <p>Turn Order</p>
            {sortedCharacters.map((character) => {
                if (character.character.current_hit_points <= 0) {
                    return (
                        <div key={character.id}>
                            <p>{character.character.name} - {character.character.initiative} - Dead</p>
                        </div>
                    )
                }
                if (character.inititative == null) {
                    return <></>
                }
                return (
                    <div key={character.id}>
                        <p>{character.character.name} - {character.character.initiative}</p>
                    </div>
                )
            })}
        </div>
    )
}

interface AddWEncounterCharacterDialogProps {
    encounterId: string
}

const AddEncounterCharacterDialog: React.FC<AddWEncounterCharacterDialogProps> = ({ encounterId }) => {

    const queryClient = useQueryClient()

    const availableCharactersForEncounterQuery = useQuery({
        queryKey: ['availableCharactersForEncounter', encounterId],
        queryFn: async () => {
            let res = await invoke('load_characters_command', {})
            console.debug("Rust Return load_characters_command for encounter", res)
            let data = JSON.parse(res as string)
            return data
        }
    })

    const addCharacterToEncounterMutation = useMutation({
        mutationFn: async (values: { characterId: string, encounterId: string }) => {
            console.debug("Add character to encounter", values)
            let res = await invoke('add_character_to_encounter_command', { characterId: values.characterId, encounterId: values.encounterId });
            return res
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['availableCharactersForEncounter', encounterId] })
        }
    })


    return (
        <div>
            <Dialog>
                <DialogTrigger>
                    <Button>Add Character</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add characters</DialogTitle>
                        <DialogDescription>
                            Add characters to the encounter
                        </DialogDescription>
                        {
                            availableCharactersForEncounterQuery.isLoading && <p>Loading...</p>
                        }
                        {
                            availableCharactersForEncounterQuery.isError && <p>Error loading characters</p>
                        }
                        {
                            availableCharactersForEncounterQuery.data && availableCharactersForEncounterQuery.data.map((character: any) => {
                                console.log("Character for encounter", character)
                                return (
                                    <div key={character.id} className='flex items-center container'>
                                        <p>{character.name}</p>
                                        <div className='flex-grow' />
                                        <Button onClick={() => addCharacterToEncounterMutation.mutate({ characterId: character.id, encounterId: encounterId })}>Add</Button>
                                    </div>
                                )
                            })
                        }
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}