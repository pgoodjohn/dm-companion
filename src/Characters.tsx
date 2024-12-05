import React from 'react';
import NewCharacterDialog from './NewCharacterDialog';
import CharactersTable from './CharactersTable';


const Characters: React.FC = () => {
    return (
        <div>
            <p>Characters</p>
            <NewCharacterDialog />
            <CharactersTable />
        </div>
    );
};


export default Characters;