import React from 'react'
import { getFormattedValue } from '../services/mondayService'

export default function ItemRow({item}) {

    console.log('item', item);

    return (
        <tr>
            {[{text: item.name},...item.column_values].map(colVal=><td>{getFormattedValue(colVal.type,colVal.text, true)}</td>)}    
        </tr>
    )
}
