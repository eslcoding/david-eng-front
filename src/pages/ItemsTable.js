import React, { useEffect, useRef, useState } from 'react'
import Button from "monday-ui-react-core/dist/Button.js"
import ItemRow from '../cmps/ItemRow';
import {
     getFilteredColVals, getFormattedValue, getNumOfItems,
    getTablePdfBody, getTitles, getTitlesReverse, getWorkHoursSum, reverse, reverseSentence, myFont, isHebrew, getBoardsName, getPdfTitle
} from '../services/mondayService';

import { jsPDF } from "jspdf";
import 'jspdf-autotable'
// import { pdfFromHTML } from '../services/pdfService';



export default function ItemsTable({ itemsByBoards, onToggleTable, filterTerms, isAllBoards }) {
    const [itemsByBoardsArr, setItemsByBoardsArr] = useState(null)
    const ref = useRef(null)
    
    // useEffect(() => {
    //     if (!itemsByBoards) return

    //     console.log('itemsByBoards: ', itemsByBoards);
    //     const boardsIds = Object.keys(itemsByBoards)
    //     const itemsVals = Object.values(itemsByBoards)
    //     let items = itemsVals.map(getDateFilteredItems)
    //     items = getFilteredColVals(items)
    //     setItemsByBoardsArr(items)

    // }, [itemsByBoards])

    useEffect(() => {
        // if (!itemsByBoards) return
        if (itemsByBoards) {
            // console.log('itemsByBoards: ', itemsByBoards);
            // console.log('filterTerms: ', filterTerms);
            
            const itemsVals = Object.values(itemsByBoards)
            let items = itemsVals.map(getDateFilteredItems)
            items = getFilteredColVals(items).filter(items => items.length)
            console.log('itemsTable items: ', items);
            
            setItemsByBoardsArr(items)
        }

    }, [itemsByBoards, isAllBoards])



    const getDateFilteredItems = ({ itemsToUse, colsToUse, searchTerm }) => {
        return itemsToUse.filter(item => {
            return item.column_values.every(colVal => {
                let date = new Date(colVal.text)
                let start = new Date(searchTerm.date.start)
                let end = new Date(searchTerm.date.end)
                start.setHours(0, 0)
                end.setHours(23, 59)
                if (colsToUse.dateId === colVal.id) {
                    start = start.getTime() || -Infinity
                    end = end.getTime() || Infinity
                    if (start || end) {
                        return ((date.getTime() > start) && (date.getTime() < end))
                    } else {
                        return (((date.getTime() || Infinity) > start) && ((date.getTime() || -Infinity) < end))
                    }
                } else return true
            })
        })
    }

    const saveToPdf = () => {
        const boardsNames = getBoardsName(itemsByBoardsArr)
        // const doc = new jsPDF();
        var doc = new jsPDF('l', 'mm', 'a4');
        doc.setR2L(true)

        doc.addFileToVFS("MyFont.ttf", myFont);
        doc.addFont("MyFont.ttf", "MyFont", "normal");
        doc.setFont("MyFont");
        console.log('filterTermsfilterTermsfilterTerms: ', filterTerms);

        

        const titles = []
        const body = []

        titles.unshift('דוח שרטט')
        titles.unshift('מתאריך')
        titles.unshift('עד תאריך')
        titles.unshift('מספר תכניות')
        titles.unshift('סכום שעות עבודה חודש נוכחי')
        titles.unshift('שעות עבודה במצטבר')
        body.unshift(getFormattedValue('text', filterTerms.draftsman.nameStr))
        body.unshift(getFormattedValue('date', filterTerms.date.start))
        body.unshift(getFormattedValue('date', filterTerms.date.end))
        body.unshift(reverse(getNumOfItems(itemsByBoardsArr) + ''))
        body.unshift(reverse(getWorkHoursSum(itemsByBoardsArr, 'שעות עבודה חודש נוכחי') + ''))
        body.unshift(reverse(getWorkHoursSum(itemsByBoardsArr, 'שעות עבודה במצטבר') + ''))
        doc.autoTable({
            theme: 'grid',
            styles: {
                font: 'MyFont',
                fontSize: 12,
                halign: 'right',
            },

            margin: { right: 60, left: 60 },
            head: [titles],
            body: [body],
            // showHead: 'never'
        });
        itemsByBoardsArr.forEach((items, idx) => {

            let titlesForPdf = [`שם תכנית`, ...getTitlesReverse(items)]
            console.log('------------------------------------------------');
            let tablePdfBody = getTablePdfBody(items)
            const isR2L = doc.getR2L()
            console.log('doc.lastAutoTable: ', doc.lastAutoTable);

            const startYPos = doc.lastAutoTable.finalY + 70
            const boardName = boardsNames[idx]
            if (!isHebrew(boardName || '')) {
                doc.setR2L(false)
            } else doc.setR2L(true)
            // doc.text(boardName, 149, startYPos - 5, { align: 'center' })
            // doc.autoTable({
            //     theme: 'plain',
            //     startY: startYPos-10,
            //     head: [[boardName]]
            // })
            doc.setR2L(true)
            doc.autoTable({
                theme: 'grid',
                headStyles: { fillColor: '#2B80BA' },
                footStyles: { fillColor: '#ffffff', textColor: '#000000' },
                alternateRowStyles: { fillColor: '#f0f0f0' },
                rowPageBreak: 'avoid',
                styles: {
                    font: 'MyFont',
                    fontSize: 11,
                    halign: 'center',
                },
                startY: startYPos,
                minCellWidth: 90,
                head: [titlesForPdf],
                // head: [[{content: boardName, colSpan: titlesForPdf.length}] ,titlesForPdf],

                body: tablePdfBody,
                foot: [[boardName]],
                // foot: [{
                //     content: boardName,
                //     colSpan: titlesForPdf.length,
                // }],
                showHead: 'firstPage',
                // margin: { top: 40 },

                // didParseCell: (data) => {
                //     const { doc, cell, section, column, row } = data
                //     if (section === 'head' && row.index === 0) {
                //         // console.log('foottt');
                //         cell.styles.fillColor = '#ffffff'
                //         cell.styles.textColor = '#000000'
                //         cell.styles.fontSize = 12
                //     }

                // },

                willDrawCell: (data) => {
                    const { doc, cell: { raw } } = data
                    const isDateReg = /\d{4}\/\d{2}\/\d{2}/g
                    let isR2L = true
                    if (!isDateReg.test(raw) && !isHebrew(raw || '')) {
                        isR2L = false
                    }
                    doc.setR2L(isR2L)

                },

                didDrawCell: (data) => {
                    const { doc, column, row } = data
                    // if (column.index === 0 && row.index === 0) {
                    // }

                }

            });
        })

        doc.save(`${getPdfTitle(filterTerms)}.pdf`);
    }

    return (
        <>

            {itemsByBoardsArr &&
                <div ref={ref} className="wrapper-container">
                    <section className="table-data-container">
                        <section className="table-data">

                            <Button className="pdf-btn" onClick={saveToPdf}>PDF</Button>
                            <section className="table-data-box">
                                <p className="table-data-row"><span>{filterTerms.draftsman.nameStr}</span><span>:דוח שרטט</span></p>
                                <p className="table-data-row"><span>:עד תאריך <br />{getFormattedValue('date', filterTerms.date.end, true)}</span><span>:מתאריך<br />{getFormattedValue('date', filterTerms.date.start, true)}</span></p>
                                <p className="table-data-row"><span>{getNumOfItems(itemsByBoardsArr)}</span><span> :מספר תכניות</span></p>
                                <p className="table-data-row"><span>{getWorkHoursSum(itemsByBoardsArr, 'שעות עבודה חודש נוכחי')}</span><span>:סכום שעות עבודה חודש נוכחי</span></p>
                                <p className="table-data-row"><span>{getWorkHoursSum(itemsByBoardsArr, 'שעות עבודה במצטבר')}</span><span>:סכום שעות עבודה במצטבר</span></p>
                            </section>
                        </section>
                    </section>
                    <section className="tables-section">
                        <Button className="toggle-view-btn" onClick={() => onToggleTable()}>חזור</Button>

                        {itemsByBoardsArr.map((items, idx) => {

                            return (
                                <section key={idx} className="wrapper-section">
                                    <h4 className="table-name">{items[0]?.board.name}</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                {['שם תכנית', ...getTitles(items)].map((title, idx) => {
                                                    if (idx === 0) return <th key={idx} colSpan="1">{title}</th>
                                                    return <th key={idx}>{title}</th>
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, idx) => <ItemRow key={idx} item={item} />)}
                                        </tbody>
                                    </table>
                                </section>
                            )
                        })}
                    </section>
                </div>}
        </>
    )
}
