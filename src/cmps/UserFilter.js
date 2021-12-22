import React, { useState } from 'react'
import Select from 'react-select';
import DatePicker from "react-datepicker";
import Button from "monday-ui-react-core/dist/Button.js"


// import { useParams, useLocation, useHistory, useRouteMatch } from 'react-router-dom';

function UserFilter({ users, searchMissions, itemsByBoards, onToggleTable }) {
    const [draftsman, setDraftsman] = useState(null)
    const [date, setDate] = useState({ start: '', end: '' })



    const handleSelect = (_draftsman) => {
        console.log('handleSelect -> _draftsman', _draftsman)
        setDraftsman(_draftsman)
        // searchMissions({ draftsman: { name: _draftsman?.label, id: _draftsman?.value, nameStr: _draftsman.id }, date })

    }


    const handleInput = ({ target: { value, name } }) => {
        console.log('handleInput -> value, name', value, name)
        setDate({ ...date, [name]: value })
        // searchMissions({ draftsman: { name: draftsman?.label, id: draftsman?.value }, date: { ...date, [name]: value } })

    }



    const onSearchMissions = async (ev) => {
        ev.preventDefault()
        if (!draftsman) return
        await searchMissions({ draftsman: { name: draftsman.label, id: draftsman.value, nameStr: draftsman.id }, date })
        onToggleTable()
    }
    const label = <span></span>

    const options = users.map(user => { return {id: user.name, value: user.id, label: <div className="user-draftsman"><span>{user.name}</span><img src={user.photo_thumb_small} /></div> } })
    return (

        <form className="add-column">
            <Select
                placeholder="בחר/י שרטט להצגה"
                value={draftsman}
                options={options}
                onChange={handleSelect}
                className='check'
                isSearchable
                getOptionValue={option => option['id']}
            />
            {/* <DatePicker  dateFormat='dd/MM/yyyy' selected={startDate} onSelect={handleInput} /> */}


            {/* <DatePicker selected={startDate} onSelect={handleInput} /> */}
            <label>:מתאריך</label>
            <input name="start" className="date-input" type="date" value={date.start} onChange={handleInput} />
            <label>:עד</label>
            <input name="end" className="date-input" type="date" value={date.end} onChange={handleInput} />
            {/* {itemsByBoards && <Button kind={Button.kinds.PRIMARY} onClick={onSearchMissions} style={{ width: '150px' }} size={Button.sizes.MEDIUM}>חפש</Button>} */}
            {<Button kind={Button.kinds.PRIMARY} onClick={onSearchMissions} style={{ width: '150px' }} size={Button.sizes.MEDIUM}>חפש</Button>}

        </form>
    )
}

export default UserFilter
