import React, { useState } from "react";
import style from "../component/css/Teams.module.css";
import { IoFilter, IoSettingsOutline } from "react-icons/io5";
import { IoMdAdd, IoMdContacts } from "react-icons/io";
import { Ri24HoursLine } from "react-icons/ri";
import { BiDotsHorizontal } from "react-icons/bi";
import { MdOutlineEventNote, MdOutlineLink } from "react-icons/md";
import teamIcon from "../images/Group 14124.png";

const Teams = () => {
  const [channels, setChannels] = useState(["Business"]);
  const [links, setLinks] = useState([]);

  const handleAddChannel = () => {
    const newChannelName = `Channel ${channels.length + 1}`;
    setChannels([...channels, newChannelName]);
  };

  const handleAddLink = () => {
    const newLink = `https://example.com/link${links.length + 1}`;
    setLinks([...links, newLink]);
    alert(`New link created: ${newLink}`);
  };

  return (
    <div className={style.teamscontainer}>
      <div className={style.teamheader}>
        <div className={style.righttopheader}>
          <h3>Communities</h3>
          <div className={style.headericons}>
            <div className={style.cornericon} title="Filter">
              <IoFilter />
            </div>
            <div className={style.cornericon} title="Add community">
              <IoMdAdd />
            </div>
          </div>
        </div>

        {channels.map((channel, index) => (
          <div key={index} className={style.busniesscontainer}>
            <div className={style.busineesheader}>
              <div className={style.businessicons}>
                <Ri24HoursLine />
              </div>
              <h3>{channel}</h3>
            </div>
            <div className={style.businesssecondicon} title="More option">
              <BiDotsHorizontal />
            </div>
          </div>
        ))}

        <div className={style.addchannelcontainer} onClick={handleAddChannel}>
          <div className={style.channaladdicon} title="Add Group">
            <IoMdAdd />
          </div>
          <p>Add Channel</p>
        </div>
      </div>

      <div className={style.teamrightside}>
        <div className={style.righttopcontainer}>
          <div className={style.navcontaineleft}>
            <div className={style.paranav}>
              <p>Post</p>
            </div>
            <div className={style.paranav}>
              <p>Files</p>
            </div>
            <div className={style.paranav}>
              <p>Photos</p>
            </div>
          </div>
          <div className={style.navcontainerright}>
            <div className={style.modelcontainer} title="Event">
              <MdOutlineEventNote />
              <p>Events</p>
            </div>
            <div className={style.navbariconsleft}>
              <div className={style.finaliconsnavbar1} title="Invite members">
                <IoMdContacts />
              </div>
              <div
                className={style.finaliconsnavbar}
                title="Link"
                onClick={handleAddLink}
              >
                <MdOutlineLink />
              </div>
              <div className={style.finaliconsnavbar} title="Settings">
                <IoSettingsOutline />
              </div>
            </div>
          </div>
        </div>

        <div className={style.teamimages}>
          <img src={teamIcon} alt="Team Icon" className="businessiconsactive" />
          <p>Welcome to your new channel!</p>
        </div>
      </div>
    </div>
  );
};

export default Teams;
