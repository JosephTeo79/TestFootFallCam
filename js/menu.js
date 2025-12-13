// menu.js
const menuData = [
  { title: "Introduction", url: "introduction.html", icon: "icon/pdf.png" },
  { 
    title: "Front Office", 
    icon: "icon/folder.jpg",
    children: [
      { title: "POS Training Document", url: "FrontOffice/POS_Training_Document.pdf", icon: "icon/pdf.png" },
      { title: "Login Logout", resource: "FrontOffice/Login_Logout", icon: "icon/pdf.png" },
      { title: "Open Register", resource: "FrontOffice/Open_Register", icon: "icon/pdf.png" }
    ]
  },
  { title: "Back Office", icon: "icon/folder.jpg", children: [] },
  { title: "Support Handbook", url: "notebooklm.html", icon: "icon/NoteBooklm.png" }
];
