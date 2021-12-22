import React from "react";
import "../App.css";
import Swal from 'sweetalert2';

import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css"
//Explore more Monday React Components here: https://style.monday.com/
import AttentionBox from "monday-ui-react-core/dist/AttentionBox.js"
import mondayService, { detectLang } from "../services/mondayService";
import UserFilter from "../cmps/UserFilter";
import ItemsTable from "./ItemsTable";
const monday = mondaySdk();


class Home extends React.Component {

  // Default state
  state = {
    users: null,
    filterTerms: { draftsman: null, startDate: '', endDate: '' },
    itemsByBoards: null,
    isShowTable: false,
    boardsNum: null,
    isShowTables: false,
    isAllBoards: false
  };


  async componentDidMount() {
    var query;

    query = `query {
      users  {
          id
          name
          email
          photo_thumb_small
          account {
              name
              }
          }
  }`
    try {
      let res = await monday.api(query)
      const { users } = res.data
      this.setState({ users })

    } catch (err) {

    }



  }

  getItemsIds = async (boardId) => {
    const query = `
    query 
      { boards (ids:${boardId}) 
        { items {
           id
      
          }
        }
      }`
    const { data } = await monday.api(query)
    const { items } = data.boards[0]
    return items.map(item => item.id)

  }


  setSelectedColumn = (selectedColumn) => {
    this.setState({ selectedColumn })
  }

  authMonday = () => {
    mondayService.authMonday()
  }

  searchMissions = async (searchTerm) => {
    console.log('searchMissions= -> searchTerm', searchTerm)
    this.setState({ filterTerms: searchTerm })
    this.setState({ itemsByBoards: null })
    var query = `query {boards (limit: 1000) {
      name
      id
      columns {
        id
        title
        type
        settings_str
      }
    }}`
    const { data: { boards } } = await monday.api(query)
    const filteredBoards = this.getDraftsmanBoard(boards)

    // this.setState({ boardsNum: filteredBoards.length })
    var items = []
    filteredBoards.forEach(async (board, idx) => {
      // for (let idx = 0; idx < filteredBoards.length; idx++) {
      // const board = filteredBoards[idx];

      query = `query {
        boards(ids: ${board.id}) {
            items {
              name
              id
              board{name}
              column_values {
                    text
                    id
                    value
                    type
                    title
                    additional_info
                }
            }
        }
    }`
      const { colsToUse } = board
      const { data: { boards } } = await monday.api(query)

      var itemsToUse = boards[0].items.filter(item => {
        return item.column_values.some(colVal => {
          if (colsToUse.draftId === colVal.id && colVal.value) {
            const parsedValue = JSON.parse(colVal.value).personsAndTeams
            const isIncludeDraftsman = parsedValue.some(draftsman => draftsman?.id === searchTerm.draftsman.id)
            if (isIncludeDraftsman) return true

          }
          return false
        })
      })



      itemsToUse = itemsToUse.filter(item => {
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
      if (!itemsToUse.length) return

      this.setState({ itemsByBoards: { ...this.state.itemsByBoards, [board.id]: { itemsToUse, colsToUse, searchTerm } } }, () => {

        let isAllBoards = (Object.values(this.state.itemsByBoards).length === filteredBoards.length)
        if (isAllBoards) {
          this.setState({ isAllBoards })
        }

      })


    })
    return Promise.resolve()

  }




  getItemsByDraftsman = (items, searchTerm, colsToUse) => {
    return items.filter(item => {
      return item.column_values.some(colVal => {
        if (colsToUse.draftId === colVal.id && colVal.value) {
          const parsedValue = JSON.parse(colVal.value).personsAndTeams
          const isIncludeDraftsman = parsedValue.some(draftsman => draftsman?.id === searchTerm.draftsman.id)
          if (isIncludeDraftsman) return true

        }
        return false
      })
    })
  }


  getItemsByDate = (items, searchTerm, colsToUse) => {
    return items.filter(item => {
      return item.column_values.every(colVal => {
        let date = new Date(colVal.text)
        let start = new Date(searchTerm.date.start)
        let end = new Date(searchTerm.date.end)
        start.setHours(0, 0)
        end.setHours(23, 59)
        if (colsToUse.dateId === colVal.id) {
          start = start.getTime() || -Infinity
          end = end.getTime() || Infinity
          return (((date.getTime() || Infinity) > start) && ((date.getTime() || -Infinity) < end))
        } else return true
      })
    })
  }


  getDraftsmanBoard = (boards) => {
    return boards.filter((board) => {
      const titles = ['שרטט', 'סטטוס שרטוט', 'תאריך תכנית']
      if (board.name.includes('סידור שבועי')) return false
      
      let isIncludeBoard = false
      board.columns.forEach(col => {

        if (col.title === 'שרטט') {
          board.colsToUse = { ...board.colsToUse, draftId: col.id }
          isIncludeBoard = true
        }

        if (col.title === 'סטטוס שרטוט') {
          board.colsToUse = { ...board.colsToUse, statusId: col.id }
        }

        if (col.title === 'תאריך תכנית') {
          board.colsToUse = { ...board.colsToUse, dateId: col.id }
        }

      })
      return isIncludeBoard
    })
  }



  onToggleTable = () => {
    this.setState({ isShowTable: !this.state.isShowTable })
  }



  render() {
    // const { columns } = this.state
    // if (!columns) return <div>Loading..</div>
    const { users, isShowTable, itemsByBoards, filterTerms, isAllBoards } = this.state
    const containerClass = isShowTable ? 'table-container' : 'container'
    return (
      <div className={containerClass} >
        { users && !isShowTable && <UserFilter itemsByBoards={itemsByBoards} onToggleTable={this.onToggleTable} searchMissions={this.searchMissions} users={users} />}
        { isShowTable && <ItemsTable isAllBoards={isAllBoards} filterTerms={filterTerms} onToggleTable={this.onToggleTable} itemsByBoards={itemsByBoards} />}
      </div>
    )
  }
}
const style = {
  backgroundColor: ""
}

export default Home;
