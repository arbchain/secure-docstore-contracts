import React, { useState } from 'react'
import { Menu, Segment } from 'semantic-ui-react'
import { Link, useHistory } from "react-router-dom";

export default function Header() {

  let history = useHistory()
  console.log(history)

  const [activeItem, setActiveItem] = useState(history.location.pathname)
  
  const handleClick = (selected) => {setActiveItem(selected); history.push(`/${selected}`)}

  return(
      <Segment inverted color='violet'>
        <Menu inverted pointing secondary>
          <Menu.Item
            name='dashboard'
            active={history.location.pathname === '/dashboard'}
            onClick={(e, item) => handleClick(item.name)}
          />
          <Menu.Item
            name='documents'
            active={history.location.pathname === '/documents'}
            onClick={(e, item) => handleClick(item.name)}
          />
          <Menu.Item
            name='profile'
            active={history.location.pathname === '/profile'}
            onClick={(e, item) => handleClick(item.name)}
          />
        </Menu>
      </Segment>
    )
}