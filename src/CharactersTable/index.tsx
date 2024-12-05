import { ColumnDef } from "@tanstack/react-table";

type CharacterTableColumns = {
    id: string
    name: string
    class: string
    race: string,
}

const columns: ColumnDef<CharacterTableColumns>[] = [
    {
        header: 'ID',
        accessorKey: 'id',
    },
    {
        header: 'Name',
        accessorKey: 'name',
    },
    {
        header: 'Class',
        accessorKey: 'class',
    },
    {
        header: 'Race',
        accessorKey: 'race',
    },
]

import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    useQuery,
} from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

const CharactersTable: React.FC = () => {
    const charactersQuery = useQuery({
        queryKey: ['characters'],
        queryFn: async () => {
            let res = await invoke('load_characters_command', {});

            console.debug("Rust Return", res)
            let data = JSON.parse(res as string)
            return data
        }
    })

    if (charactersQuery.isLoading) {
        return <div>Loading...</div>
    }

    if (charactersQuery.isError) {
        return <div>Error loading tasks</div>
    }

    if (charactersQuery.data) {
        console.debug("Loaded Data", charactersQuery.data)
    }

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={charactersQuery.data} />
        </div>
    )
}

export default CharactersTable;


function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
