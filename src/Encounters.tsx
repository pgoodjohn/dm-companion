import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { Input } from "./components/ui/input";
import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import { Button } from "./components/ui/button";
import { Link } from "@tanstack/react-router";

const Encounters: React.FC = () => {

    return (
        <div>
            <p>Encounters</p>
            <NewEncounterForm />
            <EncountersList />
        </div>
    );
}

const EncountersList: React.FC = () => {
    const encountersListQuery = useQuery({
        queryKey: ['encounters'],
        queryFn: async () => {
            let res = await invoke('load_encounters_command', {});

            console.debug("Rust Return", res)
            let data = JSON.parse(res as string)
            return data
        }
    })

    if (encountersListQuery.isLoading) {
        return <p>Loading...</p>
    }

    if (encountersListQuery.isError) {
        return <p>Error</p>
    }

    if (encountersListQuery.data.length === 0) {
        return <p>No Encounters</p>
    }

    return (
        <div>
            {encountersListQuery.data.map((encounter: any) => {
                return (
                    <div key={encounter.encounter_title}>
                        <Link to={"/encounters/" + encounter.id}>{encounter.encounter_title}</Link>
                    </div>
                );
            })}
        </div>
    )
}


export default Encounters

const NewEncounterForm: React.FC = () => {

    const queryClient = useQueryClient()

    const newEncounterMutation = useMutation({
        mutationFn: async (values: { title: string }) => {
            let res = await invoke('create_encounter_command', { encounterTitle: values.title });
            return res
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['encounters'] })
        }
    })

    const encounterForm = useForm({
        defaultValues: {
            title: '',
        },
        onSubmit: async (values) => {
            console.debug("Submitting", values)
            await newEncounterMutation.mutate(values.value)
        }
    })

    return (
        <div>
            <p>New Encounter</p>
            <form onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                encounterForm.handleSubmit()
            }}>
                <encounterForm.Field
                    name="title"
                    children={(field) => (
                        <div>
                            <Input
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                placeholder="Name"
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </div>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </div>
    );
}