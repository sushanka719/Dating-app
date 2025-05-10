import React, { useState, useEffect } from 'react'
import SideBar from '../components/SideBar'
import { Outlet } from 'react-router-dom';
import styles from '../styles/DatingApp.module.css'
// import kiss from '../assets/kiss.png'
// import filter from '../assets/filter.png'
// import BumblePartnerSelector from '../components/BumblePartnerSelector';
// import DatingAppHeader from '../components/DatingAppHeader';
// import Chat from '../components/Chat';

const DatingApp = () => {
  const [option, setOption] = useState(false);

  return (
    <div className={styles.container}>
      <SideBar setOption={setOption} option={option} />
      <main className={styles.right_container}>
        {/* <BumblePartnerSelector /> */}
        <Outlet context={{ setOption}}></Outlet>
        {/* <Chat/> */}
      </main>
    </div>
  )
}

export default DatingApp
