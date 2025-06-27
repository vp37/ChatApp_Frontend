// import { useEffect, useState, useRef } from "react";
// import style from "../component/css/Chat.module.css";
// import {
//   IoFilter,
//   IoVideocamOutline,
//   IoCall,
//   IoAdd,
//   IoSendSharp,
//   IoCloseCircle,
// } from "react-icons/io5";
// import {
//   MdOpenInNew,
//   MdGroupAdd,
//   MdEmojiEmotions,
//   MdInsertPhoto,
// } from "react-icons/md";
// import { RiCheckboxCircleLine } from "react-icons/ri";
// import { IoCloseSharp } from "react-icons/io5";
// import { BiDotsHorizontal } from "react-icons/bi";
// import { IoClose } from "react-icons/io5";
// import { FaVideo } from "react-icons/fa";
// import { BsLink45Deg } from "react-icons/bs";
// import axios from "axios";
// import { useSelector, useDispatch } from "react-redux";
// import { setUserList, setSelectedUser } from "../redux/ChatSlice";
// import EmojiPicker from "emoji-picker-react";
// import { MdOutlineSettingsVoice, MdStopCircle } from "react-icons/md";

// const Chat = () => {
//   const dispatch = useDispatch();
//   const userList = useSelector((state) => state.chat.userList) || [];
//   const selectedUser = useSelector((state) => state.chat.selectedUser);
//   const token = useSelector((state) => state.auth.token);
//   const loggedInUsername = useSelector((state) => state.auth.user?.username);
//   const [message, setMessage] = useState("");
//   const [chatMessages, setChatMessages] = useState([]);
//   const [activeTab, setActiveTab] = useState(0);
//   const ws = useRef(null);
//   const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
//   const [requestedUsers, setRequestedUsers] = useState([]);
//   const you = useSelector((state) => state.auth.user);
//   const [showPicker, setShowPicker] = useState(false);
//   const [recording, setRecording] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const fileInputRef = useRef();
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [popupFile, setPopupFile] = useState(null);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   useEffect(() => {
//     axios
//       .get(`http://127.0.0.1:8000/accept-getdata/${you?.id}/`)
//       .then((res) => dispatch(setUserList(res.data)))
//       .catch((err) => console.error("Error fetching user data", err));
//   }, [dispatch]);

//   useEffect(() => {
//     if (!selectedUser || !you) return;

//     axios
//       .get(`http://127.0.0.1:8000/accepted-friends/${you.id}/`)
//       .then((res) => {
//         const { sending_messages, receiver_messages } = res.data;

//         const filteredSender = sending_messages
//           .filter((msg) => msg.receiver === selectedUser.id)
//           .map((msg) => ({
//             ...msg,
//             from: "sender",
//             files: Array.isArray(msg.files)
//               ? msg.files
//                   .filter((file) => file && file.file)
//                   .map((file) => ({
//                     id: file.id,
//                     url: file.file,
//                     name: file.name,
//                   }))
//               : [],
//           }));

//         const filteredReceiver = receiver_messages
//           .filter((msg) => msg.sender === selectedUser.id)
//           .map((msg) => ({
//             ...msg,
//             from: "receiver",
//             files: Array.isArray(msg.files)
//               ? msg.files
//                   .filter((file) => file && file.file)
//                   .map((file) => ({
//                     id: file.id,
//                     url: file.file,
//                     name: file.name,
//                   }))
//               : [],
//           }));
//         const combinedMessages = [...filteredSender, ...filteredReceiver];

//         combinedMessages.sort(
//           (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
//         );

//         setChatMessages(combinedMessages);
//       })
//       .catch((err) => {
//         console.error("Error fetching accepted friend messages", err);
//       });
//   }, [selectedUser, you]);

//   useEffect(() => {
//     if (!selectedUser || !token) return;

//     const wsUrl = `ws://127.0.0.1:8000/ws/chat/${token}/${selectedUser.id}/`;

//     ws.current = new WebSocket(wsUrl);

//     ws.current.onopen = () => {
//       console.log("WebSocket connected");
//     };

//     ws.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       setChatMessages((prev) => [...prev, data]);
//     };

//     ws.current.onclose = () => {
//       console.log("WebSocket disconnected");
//     };

//     ws.current.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     return () => {
//       if (ws.current) ws.current.close();
//     };
//   }, [selectedUser, token]);

//   const handleSend = () => {
//     if (
//       (!message.trim() && selectedFiles.length === 0) ||
//       !ws.current ||
//       ws.current.readyState !== WebSocket.OPEN
//     ) {
//       return;
//     }

//     // Send text message if present
//     if (message.trim()) {
//       const payload = {
//         Message: message,
//         localId: Date.now(),
//       };

//       setChatMessages((prev) => [
//         ...prev,
//         {
//           content: message,
//           from: "sender",
//           timestamp: new Date().toISOString(),
//           localId: payload.localId,
//         },
//       ]);

//       ws.current.send(JSON.stringify(payload));
//       setMessage("");
//     }

//     // Handle file upload if files selected
//     if (selectedFiles.length > 0) {
//       uploadFiles();
//     }
//   };

//   const uploadFiles = async () => {
//     const formData = new FormData();
//     selectedFiles.forEach((file) => {
//       formData.append("file", file);
//       formData.append("content", file.name);
//     });
//     formData.append("sender", you.id);
//     formData.append("receiver", selectedUser.id);

//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/upload-files/",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const uploadedFiles = response.data.files || [];
//       const timestamp = response.data.message.timestamp;
//       const messageId = response.data.message.id;

//       uploadedFiles.forEach((fileObj) => {
//         const fileUrl = fileObj.file;
//         console.log(fileUrl);

//         if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//           ws.current.send(
//             JSON.stringify({
//               type: "file",
//               file_url: fileUrl,
//               fileName: fileObj.file.split("/").pop(),
//               sender: you.id,
//               receiver: selectedUser.id,
//               timestamp: timestamp,
//               message_id: messageId,
//             })
//           );
//         }

//         setChatMessages((prev) => [
//           ...prev,
//           {
//             id: messageId,
//             file_url: fileUrl,
//             fileName: fileObj.file.split("/").pop(),
//             from: "sender",
//             to: selectedUser.id,
//             timestamp: timestamp,
//           },
//         ]);
//       });

//       setSelectedFiles([]);
//       setPreviewUrls([]);
//     } catch (err) {
//       console.error("File upload failed", err);
//       alert("File upload failed. Please try again.");
//     }
//   };

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

//     const urls = files.map((file) =>
//       file.type.startsWith("image/") || file.type === "application/pdf"
//         ? URL.createObjectURL(file)
//         : null
//     );
//     setPreviewUrls((prevUrls) => [...prevUrls, ...urls]);
//     e.target.value = null;
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") handleSend();
//   };

//   const getInitial = (name) => {
//     return name ? name.charAt(0).toUpperCase() : "";
//   };

//   const handleEmojiClick = (emojiData) => {
//     setMessage(message + emojiData.emoji);
//   };

//   const sendChatMessage = async ({
//     content = "",
//     voice_message,
//     file = [],
//   }) => {
//     const formData = new FormData();
//     formData.append("sender", you.id);
//     formData.append("receiver", selectedUser.id);
//     if (content) formData.append("content", content);
//     if (voice_message) formData.append("voice_message", voice_message);

//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/send/",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       setChatMessages((prev) => [...prev, response.data]);
//     } catch (err) {
//       console.error("Send failed", err);
//       alert("Send failed");
//     }
//   };

//   const handleVoiceClick = async () => {
//     if (recording) {
//       mediaRecorderRef.current.stop();
//       setRecording(false);
//     } else {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//         });
//         const mediaRecorder = new MediaRecorder(stream);
//         mediaRecorderRef.current = mediaRecorder;
//         audioChunksRef.current = [];

//         mediaRecorder.ondataavailable = (e) => {
//           if (e.data.size > 0) audioChunksRef.current.push(e.data);
//         };

//         mediaRecorder.onstop = async () => {
//           const audioBlob = new Blob(audioChunksRef.current, {
//             type: "audio/webm",
//           });
//           const voiceFile = new File([audioBlob], "voice_message.webm", {
//             type: "audio/webm",
//           });
//           await sendChatMessage({
//             content: "",
//             voice_message: voiceFile,
//             files: [],
//           });
//         };

//         mediaRecorder.start();
//         setRecording(true);
//       } catch (err) {
//         console.error("Mic error:", err);
//       }
//     }
//   };

//   const renderRightPanelContent = () => {
//     if (activeTab === 0) {
//       return (
//         <div className={style.chatmessagescontainer}>
//           {chatMessages.map((msg, index) => (
//             <div
//               key={index}
//               className={
//                 msg.from === "receiver" ? style.rightmessage : style.leftmessage
//               }
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems:
//                     msg.from === "receiver" ? "flex-end" : "flex-start",
//                   gap: "5px",
//                 }}
//               >
//                 {msg.voice_url && (
//                   <audio controls style={{ width: "200px" }}>
//                     <source
//                       src={`http://127.0.0.1:8000${msg.voice_url}`}
//                       type="audio/webm"
//                     />
//                   </audio>
//                 )}

//                 {msg.files && msg.files.length > 0 ? (
//                   <div
//                     style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
//                   >
//                     {msg.files.map((file, idx) => {
//                       const fullUrl = `http://127.0.0.1:8000${file.url}`;
//                       const isImage = file.url.match(
//                         /\.(jpeg|jpg|png|gif|webp)$/i
//                       );
//                       const isPDF = file.url.match(/\.pdf$/i);
//                       const isDoc = file.url.match(/\.(doc|docx)$/i);

//                       return (
//                         <a
//                           key={idx}
//                           href={fullUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           style={{ textDecoration: "none", color: "blue" }}
//                         >
//                           {isImage ? (
//                             <img
//                               src={fullUrl}
//                               alt={file.name || "uploaded file"}
//                               style={{
//                                 maxWidth: "200px",
//                                 maxHeight: "200px",
//                                 borderRadius: "8px",
//                               }}
//                             />
//                           ) : isPDF ? (
//                             <div
//                               style={{
//                                 width: "150px",
//                                 height: "200px",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "8px",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 flexDirection: "column",
//                                 background: "#f9f9f9",
//                               }}
//                             >
//                               <img
//                                 src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
//                                 alt="PDF"
//                                 style={{ width: "50px", height: "50px" }}
//                               />
//                               <span
//                                 style={{
//                                   fontSize: "12px",
//                                   textAlign: "center",
//                                 }}
//                               >
//                                 {file.name}
//                               </span>
//                             </div>
//                           ) : isDoc ? (
//                             <div
//                               style={{
//                                 width: "150px",
//                                 height: "200px",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "8px",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 flexDirection: "column",
//                                 background: "#f9f9f9",
//                               }}
//                             >
//                               <img
//                                 src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Microsoft_Word_2013_logo.svg"
//                                 alt="DOC"
//                                 style={{ width: "50px", height: "50px" }}
//                               />
//                               <span
//                                 style={{
//                                   fontSize: "12px",
//                                   textAlign: "center",
//                                 }}
//                               >
//                                 {file.name}
//                               </span>
//                             </div>
//                           ) : (
//                             <span>{file.name || "View File"}</span>
//                           )}
//                         </a>
//                       );
//                     })}
//                   </div>
//                 ) : msg.file_url ? (
//                   <a
//                     href={msg.file_url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style={{ textDecoration: "none", color: "blue" }}
//                   >
//                     {msg.file_url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
//                       <img
//                         src={msg.file_url}
//                         alt={msg.fileName || "uploaded file"}
//                         style={{
//                           maxWidth: "200px",
//                           maxHeight: "200px",
//                           borderRadius: "8px",
//                         }}
//                       />
//                     ) : (
//                       <span>{msg.fileName || "View File"}</span>
//                     )}
//                   </a>
//                 ) : null}

//                 {/* Display message content if present */}
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                     fontSize: "12px",
//                   }}
//                 >
//                   {msg.content && (
//                     <p style={{ fontSize: "14px" }}>{msg.content}</p>
//                   )}
//                   <span>
//                     {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       );
//     }
//     if (activeTab === "post") {
//       return (
//         <div style={{ padding: 20 }}>
//           <h2>Post</h2>
//           {selectedUser ? (
//             <p>
//               Here you can display shared files with {selectedUser.username}.
//             </p>
//           ) : (
//             <p>Please select a user to view files.</p>
//           )}
//         </div>
//       );
//     }

//     if (activeTab === "files") {
//       return (
//         <div style={{ padding: 20 }}>
//           <h2>Files</h2>
//           {selectedUser ? (
//             <p>
//               Here you can display shared files with {selectedUser.username}.
//             </p>
//           ) : (
//             <p>Please select a user to view files.</p>
//           )}
//         </div>
//       );
//     }

//     if (activeTab === "photos") {
//       return (
//         <div style={{ padding: 20 }}>
//           <h2>Photos</h2>
//           {selectedUser ? (
//             <p>
//               Here you can display shared photos with {selectedUser.username}.
//             </p>
//           ) : (
//             <p>Please select a user to view photos.</p>
//           )}
//         </div>
//       );
//     }

//     return null;
//   };

//   const handleFriendRequestClick = () => {
//     if (!you?.id) return;

//     axios
//       .get(`http://127.0.0.1:8000/friend-request/${you.id}/`)
//       .then((res) => {
//         setRequestedUsers(res.data); // res.data contains user objects
//         setShowFriendRequestModal(true);
//       })
//       .catch((err) => {
//         console.error("Error fetching friend requests", err);
//       });
//   };

//   const handleFriendRequestAction = (userId, action) => {
//     console.log(`${action.toUpperCase()} friend request for user ID ${userId}`);
//   };

//   const FriendRequestAccept = (userId) => {
//     axios
//       .post(`http://127.0.0.1:8000/accept-friend-request/`, {
//         receiver_id: you.id,
//         sender_id: userId,
//       })
//       .then((res) => {
//         console.log("Friend request accepted:", res.data);
//         setRequestedUsers((prev) => prev.filter((user) => user.id !== userId));
//         setShowFriendRequestModal(false);
//       })
//       .catch((err) => {
//         console.error("Error accepting friend request", err);
//       });
//   };

//   return (
//     <div className={style.chatcontainer}>
//       {/* Left panel - User list */}
//       <div className={style.chatheader}>
//         <div className={style.chattopheader}>
//           <h3>Chat</h3>
//           <div className={style.chatheadericons}>
//             <div className={style.cornericon} title="Filter">
//               <IoFilter />
//             </div>
//             <div className={style.cornericon} title="Meet Now">
//               <IoVideocamOutline />
//             </div>
//             <div className={style.cornericon} title="New Chat">
//               <MdOpenInNew />
//             </div>
//           </div>
//         </div>

//         {/* Display users */}
//         {userList
//           .filter((user) => user.username !== loggedInUsername)
//           .map((user, index) => (
//             <div
//               key={index}
//               className={style.chatbusniesscontainer}
//               onClick={() => {
//                 dispatch(setSelectedUser(user));
//                 setActiveTab(0);
//               }}
//               style={{
//                 cursor: "pointer",
//                 backgroundColor:
//                   selectedUser?.username === user.username
//                     ? "rgba(47, 46, 46, 0.834)"
//                     : "transparent",
//               }}
//             >
//               <div className={style.chatbusineesheader}>
//                 <div className={style.chatbusinessicons}>
//                   <div className={style.circle}>
//                     {getInitial(user.username)}
//                   </div>
//                 </div>
//                 <h3>{user.username}</h3>
//               </div>
//               <div className={style.chatbusinesssecondicon} title="Options">
//                 <BiDotsHorizontal />
//               </div>
//             </div>
//           ))}
//       </div>

//       {/* Right panel - Chat Area */}
//       <div className={style.chatrightside}>
//         <div className={style.chatrighttopcontainer}>
//           <div className={style.chatnavcontaineleft}>
//             <div className={style.chattopbusineesheader}>
//               <div className={style.chattopbusinessicons}>
//                 <div className={style.circle}>
//                   {getInitial(selectedUser?.username)}
//                 </div>
//               </div>
//               <h3>{selectedUser ? selectedUser.username : "Select a user"}</h3>
//             </div>

//             {/* Tabs for Post, Files, Photos */}
//             <div
//               className={style.chatparanav}
//               onClick={() => setActiveTab("post")}
//               style={{
//                 cursor: "pointer",
//                 borderBottom:
//                   activeTab === "post" ? "2px solid #0b93f6" : "none",
//                 fontWeight: activeTab === "post" ? "bold" : "normal",
//               }}
//             >
//               <p>Post</p>
//             </div>
//             <div
//               className={style.chatparanav}
//               onClick={() => setActiveTab("files")}
//               style={{
//                 cursor: "pointer",
//                 borderBottom:
//                   activeTab === "files" ? "2px solid #0b93f6" : "none",
//                 fontWeight: activeTab === "files" ? "bold" : "normal",
//               }}
//             >
//               <p>Files</p>
//             </div>
//             <div
//               className={style.chatparanav}
//               onClick={() => setActiveTab("photos")}
//               style={{
//                 cursor: "pointer",
//                 borderBottom:
//                   activeTab === "photos" ? "2px solid #0b93f6" : "none",
//                 fontWeight: activeTab === "photos" ? "bold" : "normal",
//               }}
//             >
//               <p>Photos</p>
//             </div>
//           </div>

//           <div className={style.chatnavcontainerright}>
//             <div className={style.navbariconsleft}>
//               <div className={style.finaliconsnavbar} title="Video Call">
//                 <FaVideo />
//               </div>
//               <div className={style.finaliconsnavbar} title="Voice Call">
//                 <IoCall />
//               </div>
//               <div
//                 className={style.finaliconsnavbar}
//                 title="Friend Request"
//                 onClick={handleFriendRequestClick}
//               >
//                 <MdGroupAdd />
//               </div>
//             </div>
//           </div>

//           {/* Friend Request Modal */}
//           {showFriendRequestModal && (
//             <div className={style.modalOverlay}>
//               <div className={style.modalContent}>
//                 <div className={style.modalHeader}>
//                   <h2>Sent Friend Requests</h2>
//                   <IoClose
//                     className={style.closeIcon}
//                     onClick={() => setShowFriendRequestModal(false)}
//                   />
//                 </div>
//                 {requestedUsers.length === 0 ? (
//                   <p style={{ marginTop: "10px" }}>
//                     No friend requests sent yet.
//                   </p>
//                 ) : (
//                   requestedUsers.map((user) => (
//                     <div key={user.id} className={style.modalUserRow}>
//                       <div className={style.modalUserIcon}>
//                         <span>{user.username}</span>
//                       </div>
//                       <div className={style.modalUserActions}>
//                         <div
//                           className={style.acceptButton}
//                           onClick={() => FriendRequestAccept(user.id, "accept")}
//                         >
//                           <RiCheckboxCircleLine />
//                         </div>
//                         <div
//                           className={style.declineButton}
//                           onClick={() =>
//                             handleFriendRequestAction(user.id, "decline")
//                           }
//                         >
//                           <IoCloseSharp />
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//         <div className={style.chatcontentarea}>{renderRightPanelContent()}</div>

//         {/* Show input box only if active tab is "post" */}

//         {activeTab === 0 && selectedUser && (
//           <div className={style.chatinput}>
//             <input
//               type="text"
//               placeholder="Type a Message"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <div className={style.chatinputicons}>
//               <div
//                 className={style.chatemojiicon}
//                 title="Emoji"
//                 onClick={() => setShowPicker(!showPicker)}
//               >
//                 <MdEmojiEmotions />
//               </div>
//               <div
//                 className={style.chatemojiicon}
//                 title="Voice Message"
//                 style={{ cursor: "pointer" }}
//                 onClick={handleVoiceClick}
//               >
//                 {recording ? (
//                   <MdStopCircle style={{ color: "red", fontSize: "14px" }} />
//                 ) : (
//                   <MdOutlineSettingsVoice style={{ fontSize: "18px" }} />
//                 )}
//               </div>
//               <div className={style.chatemojiicon} title="Insert Photo">
//                 <MdInsertPhoto />
//               </div>
//               <div className={style.chatemojiicon} title="Attach Link">
//                 <BsLink45Deg />
//               </div>
//               <div
//                 className={style.chatemojiicon}
//                 title="Add File"
//                 onClick={() => fileInputRef.current.click()}
//               >
//                 <IoAdd />
//               </div>
//               <div
//                 className={style.specialicon}
//                 onClick={handleSend}
//                 title="Send Message"
//               >
//                 <IoSendSharp />
//               </div>
//             </div>
//             {showPicker && (
//               <div
//                 style={{
//                   position: "absolute",
//                   zIndex: 1000,
//                   marginLeft: "500px",
//                   marginBottom: "500px",
//                 }}
//               >
//                 <EmojiPicker onEmojiClick={handleEmojiClick} />
//               </div>
//             )}
//           </div>
//         )}
//         <input
//           type="file"
//           multiple
//           id="chatFileInput"
//           ref={fileInputRef}
//           style={{ display: "none" }}
//           onChange={handleFileChange}
//         />

//         {selectedFiles.length > 0 && (
//           <div className={style.previewSection}>
//             <div className={style.previewList}>
//               {selectedFiles.map((file, index) => (
//                 <div key={index} className={style.previewItem}>
//                   {file.type.startsWith("image/") && previewUrls[index] ? (
//                     <div>
//                       <img
//                         src={previewUrls[index]}
//                         alt="preview"
//                         className={style.previewImage}
//                       />
//                       <button type="button" onClick={() => setPopupFile(file)}>
//                         👁
//                       </button>
//                     </div>
//                   ) : (
//                     <div>
//                       <span>{file.name}</span>
//                       <button type="button" onClick={() => setPopupFile(file)}>
//                         👁
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {popupFile && (
//           <div className={style.popupOverlay}>
//             <div className={style.popupContent}>
//               <button
//                 onClick={() => setPopupFile(null)}
//                 className={style.closeButton}
//               >
//                 <IoCloseCircle size={24} />
//               </button>

//               {popupFile.type.startsWith("image/") ? (
//                 <img
//                   src={URL.createObjectURL(popupFile)}
//                   alt="Full Preview"
//                   className={style.popupImage}
//                 />
//               ) : popupFile.type === "application/pdf" ? (
//                 <iframe
//                   src={URL.createObjectURL(popupFile)}
//                   title="PDF Preview"
//                   className={style.popupIframe}
//                 />
//               ) : (
//                 <div style={{ textAlign: "center" }}>
//                   <p>Preview not supported for this file type.</p>
//                   <a
//                     href={URL.createObjectURL(popupFile)}
//                     download={popupFile.name}
//                     className={style.downloadButton}
//                   >
//                     Download file
//                   </a>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Chat;

import React, { useState, useEffect } from 'react';
import { MdOpenInNew } from 'react-icons/md';
import axios from 'axios';
import style from '../component/css/Call.module.css';

const NewGroupChat = () => {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');

  // Fetch usernames on modal open
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/get_signup/');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const toggleUser = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const createGroup = async () => {
    try {
      const payload = {
        name: groupName,
        members: selectedMembers,
      };
      await axios.post('http://127.0.0.1:8000/groupcreate/', payload);
      alert('Group created!');
      setShowModal(false);
      setGroupName('');
      setSelectedMembers([]);
    } catch (err) {
      console.error('Error creating group:', err);
    }
  };

  return (
    <div>
      {/* New Chat Icon */}
      <div
        className={style.cornericon}
        title="New Chat"
        onClick={() => {
          setShowModal(true);
          fetchUsers();
        }}
      >
        <MdOpenInNew />
      </div>

      {/* Modal */}
      {showModal && (
        <div className={style.modal}>
          <div className={style.modalContent}>
            <h3>Create Group</h3>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
              className={style.groupInput}
            />

            <div className={style.userList}>
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`${style.userItem} ${
                    selectedMembers.includes(user.id) ? style.selected : ''
                  }`}
                >
                  {user.username}
                </div>
              ))}
            </div>

            <button className={style.createBtn} onClick={createGroup}>
              Create Group
            </button>
            <button className={style.cancelBtn} onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewGroupChat;

