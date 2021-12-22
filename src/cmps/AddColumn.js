import React, { useState } from 'react'
import Select from 'react-select';
import Button from "monday-ui-react-core/dist/Button.js"

// import { useParams, useLocation, useHistory, useRouteMatch } from 'react-router-dom';

function AddColumn({columns, createColumn }) {
    console.log('AddColumn -> columns', columns)
    const [preFix, setPreFix] = useState('')
    const [selectedOption, setSelectedOption] = useState(null)

    const handleInput = ({ target: { value } }) => {
        if (!value) return
        setPreFix(value)
    }

    const handleSelect = (selectedOption) => {
        setSelectedOption(selectedOption)
        // setSelectedColumn(selectedOption)
    }

    const onCreateColumn = (ev) => {
        ev.preventDefault()
        if (!selectedOption?.value) return
        createColumn(selectedOption.value)
    }

    const options = columns.map(column => { return { value: column.id, label: column.title } })
    console.log('AddColumn -> options', options)
    return (
        
        <form className="add-column">
            <Select
                placeholder="Choose a Status column as an ID prefix"
                value={selectedOption}
                options={options}
                onChange={handleSelect}
                className='check'
            />

            {/* <input placeholder="Choose target column prefix" onInput={handleInput} name="prefix" value={preFix} /> */}
            {/* <button onClick={onCreateColumn}>Add Column</button> */}
            <Button  kind={Button.kinds.PRIMARY} onClick={onCreateColumn} style={{ width: '150px'}} size={Button.sizes.MEDIUM}>Add Column</Button>

        </form>
    )
}

export default AddColumn
