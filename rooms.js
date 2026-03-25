/* K'DEE MOM - NATIVE PORTRAIT ROOM PAINTERS (360x640) */
var P={black:"#0a0a1a",dblue:"#1a0a2e",brown:"#5c3a1e",dbrown:"#3d2b1f",tan:"#c9a56c",pink:"#FF69B4",lpink:"#FFB6C1",gold:"#FFD700",yellow:"#FFEC8B",orange:"#FF8C00",teal:"#00CED1",sky:"#87CEEB",green:"#228B22",lgreen:"#90EE90",dgreen:"#006400",red:"#CD5C5C",dred:"#8B0000",gray:"#888",lgray:"#bbb",dgray:"#444",white:"#f0f0f0",purple:"#9B59B6",carpet:"#6B2D5B",wall1:"#4a3f5c",wall2:"#3d3450",skin:"#FDBCB4",hair:"#F0E68C",eye:"#00AA44"};
function D(c,x,y,w,h,f){c.fillStyle=f;c.fillRect(x,y,w,h);}
function rI(n){return Math.floor(Math.random()*n);}

function paintFoyer(c){
  D(c,0,370,360,270,P.carpet);for(var i=0;i<360;i+=30)D(c,i,370,1,270,"rgba(0,0,0,0.08)");
  var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,P.wall1);g.addColorStop(1,P.wall2);c.fillStyle=g;c.fillRect(0,0,360,370);
  D(c,0,330,360,40,P.dbrown);D(c,0,328,360,3,P.brown);
  D(c,120,60,120,280,P.dbrown);D(c,125,65,110,270,"#654321");D(c,215,190,8,8,P.gold);
  D(c,8,120,65,220,P.dbrown);D(c,12,125,57,210,P.brown);D(c,16,130,49,110,"#1a1a1a");
  D(c,287,120,65,220,P.dbrown);D(c,291,125,57,210,P.brown);D(c,295,130,49,110,"#1a1a1a");
  D(c,160,10,40,18,P.gold);D(c,168,25,24,6,P.yellow);
  D(c,140,480,80,22,P.dgreen);c.fillStyle=P.lgreen;c.font="7px monospace";c.fillText("WELCOME",149,496);
  D(c,260,440,60,30,"#4a3553");D(c,265,435,15,10,"#e74c3c");D(c,282,437,15,9,"#3498db");D(c,298,439,14,8,"#2ecc71");
  D(c,85,160,5,170,P.dbrown);D(c,73,155,30,6,P.dbrown);D(c,70,143,14,18,"#e74c3c");D(c,90,140,12,20,"#3498db");
  D(c,255,100,55,65,"#c0c0c0");D(c,258,103,49,59,P.sky);D(c,272,118,22,28,P.skin);
  D(c,300,380,35,45,P.brown);D(c,295,350,45,35,P.green);D(c,300,340,35,18,P.lgreen);
}
function paintKitchen(c){
  D(c,0,370,360,270,"#d4a76a");for(var i=0;i<360;i+=28)for(var j=370;j<640;j+=28){if((Math.floor(i/28)+Math.floor(j/28))%2===0)D(c,i,j,28,28,"#c99a5b");}
  var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#f5e6d3");g.addColorStop(1,"#e8d5b7");c.fillStyle=g;c.fillRect(0,0,360,370);
  for(var i=0;i<4;i++){D(c,10+i*87,20,78,75,P.dbrown);D(c,14+i*87,24,70,67,P.brown);D(c,44+i*87,52,10,6,P.gold);}
  D(c,0,270,360,35,"#888");D(c,0,268,360,3,"#aaa");
  D(c,110,160,110,60,"#555");D(c,120,170,20,20,"#333");D(c,152,170,20,20,"#333");D(c,184,170,20,20,"#333");
  c.fillStyle="rgba(200,200,200,0.25)";c.beginPath();c.arc(165,130,22,0,Math.PI*2);c.fill();
  D(c,275,80,75,190,"#ccc");D(c,279,85,67,85,"#ddd");D(c,279,175,67,90,"#ddd");D(c,344,125,5,8,"#888");D(c,344,215,5,8,"#888");
  D(c,15,272,70,28,"#bbb");D(c,40,250,12,25,"#888");
  D(c,240,262,20,8,P.gold);
}
function paintLiving(c){
  D(c,0,370,360,270,"#5c4a3a");
  var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#3d3450");g.addColorStop(1,"#4d3c5e");c.fillStyle=g;c.fillRect(0,0,360,370);
  D(c,100,60,160,100,"#222");D(c,105,65,150,90,"#111");D(c,110,70,140,80,"#1a3a5a");
  D(c,150,160,60,18,"#333");D(c,135,176,90,3,"#222");
  D(c,20,360,220,60,"#8B4513");D(c,24,355,212,10,"#A0522D");D(c,16,360,8,65,"#6B3410");D(c,240,360,8,65,"#6B3410");
  D(c,35,365,28,20,P.pink);D(c,70,362,24,22,P.gold);D(c,102,366,28,18,P.teal);D(c,140,363,26,20,P.purple);D(c,175,367,22,16,"#FF6B6B");D(c,206,364,24,18,"#FF8C00");
  D(c,270,100,80,220,P.dbrown);for(var s=0;s<4;s++){D(c,274,110+s*52,72,4,P.brown);for(var b=0;b<3;b++){D(c,278+b*23,115+s*52,19,44,["#e74c3c","#3498db","#2ecc71"][b]);}}
  D(c,60,440,200,45,"#8B2252");D(c,65,445,190,35,"#9B3262");
  D(c,260,300,5,60,P.gold);D(c,248,287,30,16,P.yellow);
}
function paintKids(c){
  D(c,0,370,360,270,"#5c6b8a");var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#4a6fa5");g.addColorStop(1,"#3d5a80");c.fillStyle=g;c.fillRect(0,0,360,370);
  c.fillStyle=P.yellow;[[25,25],[85,55],[270,18],[330,48],[180,12]].forEach(function(p){D(c,p[0],p[1],7,7,P.yellow);});
  D(c,10,140,110,220,P.dbrown);D(c,15,148,100,40,"#4169E1");D(c,15,260,100,40,P.pink);D(c,10,245,110,5,P.brown);
  D(c,140,420,70,45,"#e74c3c");D(c,140,414,70,9,"#c0392b");c.fillStyle=P.yellow;c.font="bold 9px monospace";c.fillText("TOYS",158,445);
  D(c,220,475,7,5,"#e74c3c");D(c,260,485,7,5,"#3498db");D(c,180,490,7,5,"#2ecc71");D(c,310,480,7,5,P.gold);
  D(c,220,220,130,10,P.brown);D(c,228,230,5,110,P.dbrown);D(c,342,230,5,110,P.dbrown);
  D(c,240,212,35,10,"#fff");D(c,244,214,5,5,"#e74c3c");D(c,254,215,8,4,"#3498db");
  D(c,180,60,65,55,"#fff");D(c,184,64,57,47,"#222");c.fillStyle="#0f0";c.font="7px monospace";c.fillText("GAME",198,90);c.fillText("OVER",198,100);
  D(c,305,400,28,38,P.green);D(c,296,394,14,14,P.green);D(c,320,432,14,10,P.green);
}
function paintBathroom(c){
  D(c,0,370,360,270,"#add8e6");for(var i=0;i<360;i+=22)for(var j=370;j<640;j+=22)D(c,i,j,21,21,"#9fc5d8");
  D(c,0,0,360,370,"#b0d4e8");for(var i=0;i<360;i+=22)for(var j=0;j<370;j+=22)D(c,i,j,21,21,"#a0c4d8");
  D(c,10,290,180,80,"#fff");D(c,14,294,172,72,"#cceeff");D(c,18,285,10,14,"#ccc");
  [[28,300],[55,305],[82,298],[109,302],[136,300]].forEach(function(p){D(c,p[0],p[1],11,9,P.gold);D(c,p[0]+8,p[1]-3,7,7,P.gold);c.fillStyle=P.orange;c.fillRect(p[0]+12,p[1]-1,3,2);});
  D(c,220,310,50,65,"#fff");D(c,216,300,58,14,"#eee");D(c,226,288,40,16,"#ddd");
  D(c,280,270,70,35,"#fff");D(c,308,250,18,24,"#ccc");
  D(c,275,80,75,95,"#c0c0c0");D(c,279,84,67,87,"#b0d4e8");
  D(c,165,130,38,75,P.pink);D(c,165,125,38,7,"#ccc");
}
function paintGarage(c){
  D(c,0,370,360,270,"#808080");for(var i=0;i<360;i+=50)D(c,i,370,1,270,"rgba(0,0,0,0.1)");
  D(c,0,0,360,370,"#555");
  D(c,70,30,220,300,"#777");for(var i=0;i<7;i++){D(c,74,35+i*42,212,37,"#888");D(c,74,35+i*42,212,2,"#999");}
  D(c,25,380,140,55,P.gold);D(c,33,366,124,18,"#FFEC8B");D(c,50,369,35,12,P.sky);D(c,108,369,35,12,P.sky);
  c.strokeStyle="#333";c.lineWidth=2;c.beginPath();c.arc(58,443,13,0,Math.PI*2);c.stroke();c.beginPath();c.arc(140,443,13,0,Math.PI*2);c.stroke();
  c.fillStyle="#fff";c.font="bold 6px monospace";c.fillText("'85 VETTE",57,410);
  D(c,195,385,140,50,"#c0c0c0");D(c,208,372,100,16,"#d0d0d0");D(c,220,375,30,10,P.sky);D(c,262,375,30,10,P.sky);
  c.beginPath();c.arc(228,443,12,0,Math.PI*2);c.stroke();c.beginPath();c.arc(312,443,12,0,Math.PI*2);c.stroke();
  c.fillStyle="#333";c.font="bold 6px monospace";c.fillText("'01 AUDI TT",218,408);
  D(c,15,170,12,50,"#ccc");D(c,35,180,7,40,"#aaa");D(c,52,165,16,5,P.red);D(c,52,165,4,45,"#888");
  D(c,310,140,40,40,P.tan);D(c,310,136,40,6,P.brown);c.fillStyle="#444";c.font="7px monospace";c.fillText("STUFF",315,160);
}
function paintLaundry(c){
  D(c,0,370,360,270,"#b0b0b0");D(c,0,0,360,370,"#d0d0d0");
  D(c,15,210,95,110,"#eee");D(c,28,228,70,70,"#ccc");c.strokeStyle="#aaa";c.lineWidth=2;c.beginPath();c.arc(63,263,24,0,Math.PI*2);c.stroke();D(c,22,215,14,8,"#999");D(c,40,215,14,8,"#999");
  D(c,125,210,95,110,"#eee");D(c,138,228,70,70,"#ccc");c.beginPath();c.arc(173,263,24,0,Math.PI*2);c.stroke();
  D(c,230,360,120,120,"#aaa");for(var i=0;i<6;i++){D(c,238+rI(90),370+rI(70),22+rI(14),10+rI(8),["#e74c3c","#3498db","#2ecc71",P.pink,P.gold,"#9b59b6"][i]);}
  D(c,280,340,42,8,"#888");D(c,294,330,18,12,"#666");
  D(c,240,80,110,6,P.brown);D(c,248,48,32,32,"#3498db");D(c,286,44,38,36,"#e74c3c");D(c,328,50,22,30,"#2ecc71");
}
function paintBackyard(c){
  var g=c.createLinearGradient(0,0,0,250);g.addColorStop(0,"#87CEEB");g.addColorStop(1,"#b0e0ff");c.fillStyle=g;c.fillRect(0,0,360,250);
  c.fillStyle="#FFD700";c.beginPath();c.arc(300,55,28,0,Math.PI*2);c.fill();c.fillStyle="rgba(255,215,0,0.1)";c.beginPath();c.arc(300,55,55,0,Math.PI*2);c.fill();
  D(c,0,250,360,390,P.green);for(var i=0;i<360;i+=3)D(c,i,248+rI(5),2,3+rI(7),"#1a7a1a");
  D(c,40,100,18,170,P.brown);c.fillStyle=P.green;c.beginPath();c.arc(49,90,42,0,Math.PI*2);c.fill();c.fillStyle=P.lgreen;c.beginPath();c.arc(38,78,26,0,Math.PI*2);c.fill();
  for(var f=0;f<360;f+=26){D(c,f,230,7,38,P.tan);D(c,f-1,222,9,10,P.tan);}D(c,0,248,360,5,"#b89a5a");D(c,0,260,360,5,"#b89a5a");
  D(c,230,410,28,24,"#8B6914");D(c,252,402,14,16,"#8B6914");D(c,263,405,5,3,P.black);D(c,260,410,3,2,"#333");D(c,226,430,7,9,"#8B6914");D(c,252,430,7,9,"#8B6914");
  D(c,140,450,36,12,"#1a4a1a");D(c,144,454,28,6,"#0a3a0a");
  D(c,300,380,36,36,"#333");D(c,304,370,28,12,"#555");
}
function paintAttic(c){
  D(c,0,370,360,270,"#5c4a3a");
  c.fillStyle="#3a3028";c.beginPath();c.moveTo(0,0);c.lineTo(180,100);c.lineTo(360,0);c.lineTo(360,370);c.lineTo(0,370);c.closePath();c.fill();D(c,0,367,360,4,"#4a3a2a");
  D(c,0,130,360,5,P.dbrown);D(c,0,230,360,5,P.dbrown);D(c,90,130,5,230,P.dbrown);D(c,180,100,5,260,P.dbrown);D(c,270,130,5,230,P.dbrown);
  D(c,20,320,55,40,P.tan);c.fillStyle="#555";c.font="7px monospace";c.fillText("XMAS",28,345);
  D(c,85,310,50,50,"#b89a5a");c.fillStyle="#555";c.fillText("????",95,340);
  D(c,200,330,45,28,P.tan);c.fillStyle="#555";c.fillText("2019",207,349);
  D(c,135,160,55,75,"#8B6914");D(c,139,164,47,67,"#2a2a4a");
  D(c,260,340,80,28,"#654321");D(c,260,335,80,7,"#7a5a31");D(c,292,338,18,5,P.gold);
  c.fillStyle="rgba(150,100,200,0.4)";c.beginPath();c.arc(325,310,16,0,Math.PI*2);c.fill();D(c,313,324,24,7,"#555");
}
function paintBedroom(c){
  D(c,0,370,360,270,"#d4a0b0");var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#e8d0e0");g.addColorStop(1,"#d4b0c0");c.fillStyle=g;c.fillRect(0,0,360,370);
  D(c,15,260,210,90,"#8B4513");D(c,19,255,202,8,P.white);D(c,19,265,202,80,"#DDA0DD");D(c,24,258,55,16,P.white);D(c,90,258,55,16,P.white);
  D(c,235,310,50,55,P.dbrown);D(c,244,302,12,10,P.gold);
  D(c,240,210,110,60,P.white);D(c,248,218,94,4,P.lgray);D(c,260,135,70,60,"#c0c0c0");D(c,264,139,62,52,"#FFE4E1");
  D(c,100,35,110,95,P.sky);D(c,96,30,118,5,P.white);D(c,96,130,118,5,P.white);D(c,153,35,4,95,P.white);D(c,96,35,16,95,"#DDA0DD");D(c,198,35,16,95,"#DDA0DD");
  D(c,252,200,18,18,P.green);D(c,256,190,10,14,P.pink);D(c,248,193,8,10,P.gold);
}
function paintJesusBathroom(c){
  D(c,0,370,360,270,"#f5e6c8");var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#fff8dc");g.addColorStop(1,"#f5e6c8");c.fillStyle=g;c.fillRect(0,0,360,370);
  c.fillStyle="rgba(255,215,0,0.06)";c.fillRect(0,0,360,640);
  D(c,15,290,170,75,P.gold);D(c,19,294,162,67,"#fff8dc");c.fillStyle="rgba(135,206,235,0.4)";c.fillRect(23,304,154,52);
  D(c,65,50,10,60,P.gold);D(c,45,75,50,10,P.gold);c.fillStyle="rgba(255,215,0,0.12)";c.beginPath();c.arc(70,85,38,0,Math.PI*2);c.fill();
  D(c,185,40,70,90,"#8B6914");D(c,189,44,62,82,"#f5e6c8");D(c,205,58,30,30,P.skin);D(c,200,50,40,12,"#654321");c.fillStyle=P.gold;c.beginPath();c.arc(220,46,20,Math.PI,2*Math.PI);c.fill();
  c.fillStyle="#fff";c.font="bold 6px monospace";c.fillText("JESUS SAVES",192,138);
  D(c,275,310,55,60,P.gold);D(c,271,300,63,14,"#FFEC8B");
  D(c,155,230,48,28,"#654321");c.fillStyle=P.gold;c.font="bold 6px monospace";c.fillText("BIBLE",162,248);
  D(c,320,210,7,28,"#fff");D(c,321,205,5,7,P.orange);D(c,335,215,7,22,"#fff");D(c,336,211,5,6,P.orange);
}
function paintBasement(c){
  D(c,0,0,360,640,P.black);for(var i=0;i<360;i+=36)for(var j=370;j<640;j+=36)D(c,i,j,34,34,"#2a2020");
  for(var i=0;i<360;i+=42)for(var j=0;j<370;j+=32)D(c,i,j,40,30,"#1a1010");
  c.strokeStyle="#8B0000";c.lineWidth=3;c.beginPath();var cx=180,cy=460,r=44;
  for(var pp=0;pp<5;pp++){var a=(pp*4*Math.PI/5)-Math.PI/2;var x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);pp===0?c.moveTo(x,y):c.lineTo(x,y);}c.closePath();c.stroke();c.beginPath();c.arc(cx,cy,r+4,0,Math.PI*2);c.stroke();
  [[155,440],[205,440],[160,490],[200,490],[180,425]].forEach(function(p){D(c,p[0],p[1],5,14,"#333");D(c,p[0]+1,p[1]-5,3,6,"#FF4500");});
  D(c,50,440,38,22,"#2a0a0a");c.fillStyle="#8B0000";c.font="bold 5px monospace";c.fillText("NECRONO",55,454);
  D(c,300,440,18,18,"#ddd");D(c,304,432,10,10,"#ddd");
  D(c,15,100,7,38,P.brown);D(c,13,90,11,14,"#FF4500");D(c,338,100,7,38,P.brown);D(c,336,90,11,14,"#FF4500");
}
function paintAtticGym(c){
  D(c,0,370,360,270,"#3a3a3a");c.fillStyle="#2a2828";c.beginPath();c.moveTo(0,0);c.lineTo(180,90);c.lineTo(360,0);c.lineTo(360,370);c.lineTo(0,370);c.closePath();c.fill();
  D(c,30,280,110,7,"#555");D(c,35,287,6,50,"#555");D(c,130,287,6,50,"#555");D(c,16,275,18,11,"#aaa");D(c,132,275,18,11,"#aaa");
  D(c,170,430,40,9,"#888");D(c,165,426,10,16,"#555");D(c,202,426,10,16,"#555");
  D(c,90,130,180,110,"#c0c0c0");D(c,94,134,172,102,"rgba(200,200,220,0.5)");
  D(c,280,110,70,50,"#111");c.fillStyle="#FF4500";c.font="bold 8px monospace";c.fillText("NO PAIN",288,130);c.fillText("NO GAIN",288,144);
  D(c,265,105,5,45,"#555");D(c,340,105,5,45,"#555");D(c,265,103,80,5,"#888");
  D(c,130,400,100,25,"#2ecc71");
}
function paintPantry(c){
  D(c,0,370,360,270,"#5c4a3a");var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#e8d5b7");g.addColorStop(1,"#d4c4a0");c.fillStyle=g;c.fillRect(0,0,360,370);
  for(var s=0;s<5;s++){var sy=20+s*68;D(c,10,sy+58,340,5,P.brown);for(var i=0;i<6;i++){var col=["#e74c3c","#3498db","#2ecc71","#FFD700","#9b59b6","#FF8C00"][i];D(c,18+i*56,sy,18,58,col);D(c,40+i*56,sy+8,14,50,P.tan);}}
  D(c,280,330,60,40,"#fff");c.fillStyle="#333";c.font="bold 7px monospace";c.fillText("RICE",296,355);
}
function paintLM1(c){
  D(c,0,370,360,270,"#909090");D(c,0,0,360,370,"#a0a0a0");D(c,0,10,360,7,"#666");
  for(var m=0;m<4;m++){D(c,10+m*88,200,40,110,"#ddd");D(c,54+m*88,200,40,110,"#ddd");c.strokeStyle="#bbb";c.lineWidth=2;c.beginPath();c.arc(30+m*88,255,15,0,Math.PI*2);c.stroke();c.beginPath();c.arc(74+m*88,255,15,0,Math.PI*2);c.stroke();}
  D(c,140,55,80,75,"#555");D(c,144,59,72,67,"#444");
  D(c,150,64,10,7,"#f44");D(c,164,64,10,7,"#4f4");D(c,178,64,10,7,"#f44");
  c.fillStyle="#ff0";c.font="bold 7px monospace";c.fillText("BREAKERS",150,140);
}
function paintLM2(c){
  D(c,0,370,360,270,"#808080");D(c,0,0,360,370,"#888");D(c,0,14,360,5,"#555");
  for(var m=0;m<5;m++){D(c,8+m*70,230,34,90,"#ccc");c.strokeStyle="#aaa";c.lineWidth=1;c.beginPath();c.arc(25+m*70,275,12,0,Math.PI*2);c.stroke();}
  D(c,60,80,240,28,"#444");c.fillStyle="#f44";c.font="bold 9px monospace";c.fillText("YOU ARE HERE...",78,98);
}
function paintLM3(c){
  D(c,0,370,360,270,"#707070");D(c,0,0,360,370,"#7a7a7a");
  D(c,130,20,100,28,"#006400");c.fillStyle="#0f0";c.font="bold 12px monospace";c.fillText("EXIT",160,40);
  for(var m=0;m<3;m++){D(c,15+m*120,220,80,80,"#bbb");c.strokeStyle="#999";c.lineWidth=2;c.beginPath();c.arc(55+m*120,260,22,0,Math.PI*2);c.stroke();}
  D(c,260,270,65,65,"#ccc");D(c,278,280,7,7,"#333");D(c,302,280,7,7,"#333");
  D(c,310,150,40,150,"#654321");D(c,342,220,5,5,P.gold);
}
function paintShed(c){
  D(c,0,370,360,270,"#3a3020");D(c,0,0,360,370,"#4a3828");for(var i=0;i<360;i+=32)D(c,i,0,2,370,"#3a2818");
  D(c,30,310,75,50,"#cc0000");D(c,40,298,55,16,"#333");
  D(c,150,80,5,260,"#8B6914");D(c,172,100,5,240,"#8B6914");
  D(c,260,400,28,28,P.brown);D(c,268,384,12,20,P.green);
  D(c,200,220,120,80,"#556b2f");c.fillStyle="#333";c.font="7px monospace";c.fillText("(something",210,262);c.fillText("under here)",210,274);
}
function paintGarden(c){
  var g=c.createLinearGradient(0,0,0,190);g.addColorStop(0,"#87CEEB");g.addColorStop(1,"#b0e0ff");c.fillStyle=g;c.fillRect(0,0,360,190);
  c.fillStyle="#FFD700";c.beginPath();c.arc(60,50,24,0,Math.PI*2);c.fill();
  D(c,0,190,360,450,P.green);
  for(var b=0;b<3;b++){D(c,15+b*118,210,105,75,"#3a2010");for(var pp=0;pp<3;pp++){D(c,28+b*118+pp*32,220,7,40,"#1a7a1a");D(c,25+b*118+pp*32,212,13,11,["#e74c3c","#FFD700","#9b59b6"][pp]);}}
  for(var sf=0;sf<3;sf++){D(c,240+sf*38,230,3,75,P.green);c.fillStyle=P.gold;c.beginPath();c.arc(241+sf*38,226,13,0,Math.PI*2);c.fill();}
  D(c,310,420,20,32,"#e74c3c");D(c,313,410,14,14,P.skin);D(c,310,405,20,8,"#e74c3c");
}
function paintGreyson(c){
  D(c,0,370,360,270,"#2a2a3a");c.fillStyle="#1a1a2e";c.beginPath();c.moveTo(0,0);c.lineTo(180,70);c.lineTo(360,0);c.lineTo(360,370);c.lineTo(0,370);c.closePath();c.fill();
  D(c,90,140,180,90,"#222");D(c,95,145,170,80,"#0a1a3a");D(c,110,158,40,20,"#0f0");D(c,175,165,28,14,"#f00");
  D(c,130,290,100,50,"#1a1a1a");
  D(c,15,95,55,38,"#111");c.fillStyle="#0ff";c.font="bold 7px monospace";c.fillText("CYBER",22,112);c.fillText("PUNK",24,122);
  D(c,290,90,55,42,"#111");c.fillStyle="#f0f";c.font="bold 6px monospace";c.fillText("ANIME",298,114);
  D(c,262,390,9,16,"#0f0");D(c,276,392,9,14,"#00f");D(c,290,388,9,18,"#f00");
  D(c,300,430,42,5,"#8a2be2");
}
function paintHollyGwyn(c){
  D(c,0,370,360,270,"#e8c0d0");D(c,0,0,360,370,"#f0d0e0");
  D(c,10,270,120,75,"#DDA0DD");c.fillStyle=P.pink;c.font="bold 6px monospace";c.fillText("HOLLY",42,308);
  D(c,145,270,120,75,P.sky);c.fillStyle=P.teal;c.font="bold 6px monospace";c.fillText("GWYNETH",163,308);
  D(c,275,150,75,65,"#c0c0c0");D(c,279,154,67,57,"#FFE4E1");
  for(var fl=0;fl<18;fl++){c.fillStyle=[P.pink,P.gold,P.teal,P.purple,P.orange][fl%5];c.beginPath();c.arc(10+fl*19,28+Math.sin(fl)*6,2.5,0,Math.PI*2);c.fill();}
  D(c,300,410,20,20,P.lpink);D(c,325,414,18,16,"#8B6914");
  D(c,40,55,55,45,"#fff");c.fillStyle=P.pink;c.font="6px monospace";c.fillText("SISTERS",48,80);
}
function paintForest(c){
  D(c,0,370,360,270,"#2a2a25");D(c,0,0,360,370,"#3a3a30");c.fillStyle="rgba(0,0,0,0.12)";c.fillRect(0,0,360,640);
  D(c,30,270,190,85,"#555");D(c,34,274,182,77,"#8a8a70");
  D(c,70,260,38,14,P.skin);D(c,66,254,46,9,"#654321");D(c,80,266,4,3,"#333");D(c,96,266,4,3,"#333");D(c,84,271,14,2,"#999");
  D(c,120,252,3,20,"#ccc");D(c,119,248,5,5,"#e74c3c");
  D(c,240,350,14,24,"#fff");D(c,260,354,12,20,"#e74c3c");D(c,280,348,16,26,"#3498db");
  D(c,290,150,45,38,P.pink);c.fillStyle="#fff";c.font="bold 6px monospace";c.fillText("GET",300,168);c.fillText("WELL",297,178);
  D(c,270,400,28,28,"#ddd");
  D(c,180,55,90,75,"#4a4a40");D(c,175,50,18,85,"#333");D(c,265,50,18,85,"#333");
}

var ROOMS=[
  {name:"THE FOYER",bg:paintFoyer},{name:"THE KITCHEN",bg:paintKitchen},{name:"LIVING ROOM",bg:paintLiving},
  {name:"KIDS' ROOM",bg:paintKids},{name:"BATHROOM",bg:paintBathroom},{name:"THE GARAGE",bg:paintGarage},
  {name:"LAUNDRY",bg:paintLaundry},{name:"BACKYARD",bg:paintBackyard},{name:"THE ATTIC",bg:paintAttic},
  {name:"MASTER BEDROOM",bg:paintBedroom},{name:"JESUS BATHROOM",bg:paintJesusBathroom},{name:"THE BASEMENT",bg:paintBasement},
  {name:"ATTIC GYM",bg:paintAtticGym},{name:"THE PANTRY",bg:paintPantry},{name:"LAUNDRY MAZE B1",bg:paintLM1},
  {name:"LAUNDRY MAZE B2",bg:paintLM2},{name:"LAUNDRY MAZE B3",bg:paintLM3},{name:"THE SHED",bg:paintShed},
  {name:"THE GARDEN",bg:paintGarden},{name:"GREYSON'S ROOM",bg:paintGreyson},{name:"HOLLY & GWYN'S",bg:paintHollyGwyn},
  {name:"FOREST'S ROOM",bg:paintForest}
];

function makeHS(){return[
[{id:"fdoor",x:120,y:60,w:120,h:280,name:"Front Door",look:"Locked. You need keys.",open:"LOCKED."},{id:"shoes",x:260,y:435,w:60,h:35,name:"Shoe Pile",look:"Chaotic. None match.",push:"Cheerio rolls out."},{id:"coat",x:68,y:140,w:35,h:70,name:"Coat Rack",look:"Two coats, something alive.",use:"Gum wrapper and lint."},{id:"mirror",x:255,y:100,w:55,h:65,name:"Mirror",look:"Needs coffee. And keys.",talk:"'Have fun, don't die.'"},{id:"plant",x:295,y:340,w:45,h:60,name:"Suspicious Plant",look:"Thrives on chaos.",push:"A KEY falls out!",hasKey:true},{id:"fmat",x:140,y:475,w:80,h:25,name:"Welcome Mat",look:"WELCOME. Ironic.",push:"Dead bug and disappointment."},{id:"doorL",x:0,y:120,w:75,h:240,name:"Kitchen",open:"goto:1"},{id:"doorR",x:287,y:120,w:73,h:240,name:"Living Room",open:"goto:2"},{id:"jbdoor",x:0,y:430,w:30,h:90,name:"Jesus Bathroom",open:"goto:10"},{id:"bstairs",x:140,y:510,w:80,h:45,name:"Stairs Down",look:"Dark stairs.",open:"goto:11"}],
[{id:"stove",x:110,y:155,w:115,h:65,name:"Stove",look:"All burners on. Nothing cooking.",use:"Turns off burners. Safety first."},{id:"fridge",x:275,y:78,w:78,h:195,name:"Fridge",look:"Kids' drawings. Expired coupons.",open:"Mystery leftovers. One sad yogurt."},{id:"sink",x:10,y:245,w:80,h:55,name:"Sink",look:"Full of dishes. Always.",use:"Rubber duck floats up."},{id:"banana",x:235,y:258,w:25,h:12,name:"Banana",look:"Groundbreaking.",take:"Takes it. For scale.",quest:"banana"},{id:"cab",x:8,y:15,w:345,h:80,name:"Cabinets",look:"Mismatched Tupperware.",open:"Avalanche of containers!"},{id:"kdoorL",x:0,y:300,w:14,h:200,name:"Foyer",open:"goto:0"},{id:"kdoorR",x:346,y:300,w:14,h:200,name:"Laundry",open:"goto:6"},{id:"pantry",x:160,y:320,w:50,h:40,name:"Pantry",open:"goto:13"}],
[{id:"tv",x:100,y:55,w:165,h:125,name:"TV",look:"Nobody watching. Remote MIA.",use:"Volume to 100. Dog howls."},{id:"couch",x:16,y:355,w:232,h:70,name:"Couch",look:"More pillow than couch.",push:"ALL pillows moved. Remote AND a KEY!",hasKey:true},{id:"bookshelf",x:268,y:95,w:85,h:230,name:"Bookshelf",look:"Unread since 2018.",take:"'Parenting Without Losing Your Mind.'"},{id:"lamp",x:245,y:280,w:35,h:70,name:"Lamp",look:"Only approved light.",push:"LEGO rolls out."},{id:"rug",x:60,y:435,w:200,h:50,name:"Rug",look:"Hides crumbs.",push:"Cheerios, crayon, Monopoly house."},{id:"ldoorL",x:0,y:260,w:14,h:200,name:"Foyer",open:"goto:0"},{id:"ldoorR",x:346,y:260,w:14,h:200,name:"Kids' Room",open:"goto:3"}],
[{id:"bunk",x:8,y:135,w:115,h:230,name:"Bunk Bed",look:"Top: fort. Bottom: stuffed animals.",open:"Half-eaten granola bar."},{id:"toybox",x:135,y:410,w:75,h:55,name:"Toy Box",look:"90% random objects.",open:"Avalanche of action figures."},{id:"lego",x:170,y:465,w:180,h:45,name:"LEGO Minefield",look:"Colorful landmines.",push:"OW. OWWW."},{id:"dino",x:298,y:395,w:35,h:45,name:"Mr. Rex",look:"Kids say he's real.",talk:"'Keys are in the garage.'"},{id:"poster",x:178,y:55,w:68,h:60,name:"Poster",look:"GAME OVER. Ominous."},{id:"desk",x:218,y:215,w:135,h:110,name:"Desk",look:"Crayon drawings.",open:"'Mom But Cool.'"},{id:"kdoorL",x:0,y:260,w:14,h:200,name:"Living Room",open:"goto:2"},{id:"kdoorR",x:346,y:260,w:14,h:200,name:"Bathroom",open:"goto:4"}],
[{id:"tub",x:5,y:285,w:190,h:85,name:"Bathtub",look:"Five ducks stare back.",talk:"'Where are my keys?' Silence."},{id:"ducks",x:22,y:295,w:140,h:20,name:"Duck Army",look:"General Quackers sees all.",take:"Takes General Quackers.",quest:"duck"},{id:"toilet",x:216,y:305,w:55,h:70,name:"Toilet",look:"Kids say haunted.",open:"Just a toilet."},{id:"bsink",x:276,y:265,w:75,h:40,name:"Sink",look:"Toothpaste EVERYWHERE.",use:"Toy boat surfaces."},{id:"towel",x:162,y:125,w:42,h:80,name:"Towel",look:"Seen better days.",take:"Grabs it."},{id:"bdoorL",x:0,y:260,w:14,h:200,name:"Kids' Room",open:"goto:3"},{id:"bdoorR",x:346,y:260,w:14,h:200,name:"Garage",open:"goto:5"}],
[{id:"gdoor",x:70,y:25,w:220,h:310,name:"Garage Door",look:"Stuck since 2022.",open:"Still stuck."},{id:"bench",x:8,y:160,w:58,h:60,name:"Workbench",look:"Tools and abandoned ambition.",use:"Finds a flashlight!",quest:"flashlight"},{id:"car",x:25,y:375,w:145,h:70,name:"'85 Corvette",look:"Golden beauty.",push:"Behind it: a KEY in a coffee can!",hasKey:true},{id:"boxes",x:308,y:135,w:45,h:45,name:"Boxes",look:"'STUFF.' 3 moves ago.",open:"Christmas decs from 2017."},{id:"tools",x:10,y:160,w:60,h:55,name:"Tools",look:"Hammers, wrenches.",take:"Takes the wrench."},{id:"gdoorL",x:0,y:380,w:14,h:150,name:"Bathroom",open:"goto:4"},{id:"gdoorR",x:346,y:380,w:14,h:150,name:"Backyard",open:"goto:7"}],
[{id:"washer",x:10,y:205,w:100,h:120,name:"Washer",look:"Running. Always.",open:"One sock."},{id:"dryer",x:120,y:205,w:100,h:120,name:"Dryer",look:"Lavender and regret.",open:"Three socks. None match."},{id:"laundry",x:225,y:355,w:128,h:125,name:"Mt. Washmore",look:"Sentient laundry.",push:"Missing homework."},{id:"iron",x:275,y:335,w:45,h:18,name:"Iron",look:"Last used 2021.",use:"Too much commitment."},{id:"shelf",x:236,y:44,w:115,h:48,name:"Shelf",look:"Almost empty bottles.",take:"Grabs tide pen."},{id:"ldoorB",x:0,y:260,w:14,h:200,name:"Kitchen",open:"goto:1"},{id:"mazedoor",x:346,y:380,w:14,h:150,name:"Strange Door",look:"Goes... down?",open:"goto:14"}],
[{id:"tree",x:28,y:80,w:45,h:200,name:"Oak Tree",look:"Treehouse 'in progress' 2 years.",talk:"Talks to the tree."},{id:"dog",x:225,y:400,w:42,h:42,name:"Dog",look:"Suspiciously calm.",talk:"*tail wag*",use:"Dog runs to the hole!"},{id:"hole",x:136,y:445,w:42,h:18,name:"Hole",look:"Dog looks guilty.",push:"Dirt, bone, toy car."},{id:"bbq",x:296,y:375,w:42,h:42,name:"BBQ",look:"Sacred grill.",open:"Old coals."},{id:"fence",x:0,y:222,w:360,h:48,name:"Fence",look:"Keeps dog in. Theoretically."},{id:"bdoorB",x:0,y:310,w:14,h:200,name:"Garage",open:"goto:5"},{id:"bdoorA",x:346,y:100,w:14,h:120,name:"Attic",open:"goto:8"},{id:"shed",x:100,y:340,w:70,h:55,name:"Shed",open:"goto:17"},{id:"garden",x:270,y:490,w:80,h:50,name:"Garden",open:"goto:18"}],
[{id:"xmas",x:15,y:315,w:60,h:45,name:"Xmas Box",look:"Tinsel entity.",open:"Tangled lights."},{id:"myst",x:80,y:305,w:55,h:55,name:"Mystery Box",look:"Nobody remembers this.",open:"Photo albums! VHS: DO NOT WATCH."},{id:"mirror2",x:130,y:155,w:60,h:80,name:"Old Mirror",look:"Spookier K'Dee.",talk:"Mirror-K'Dee winks."},{id:"trunk",x:255,y:335,w:85,h:30,name:"Trunk",look:"Locked. Treasure or taxes.",open:"Locked!",use:"Wrench opens it: old curtains."},{id:"crystal",x:310,y:300,w:35,h:35,name:"Crystal Ball",look:"Halloween 2022.",talk:"'Check the bedroom, dummy.'"},{id:"adoorB",x:0,y:370,w:14,h:150,name:"Backyard",open:"goto:7"},{id:"adoorR",x:346,y:370,w:14,h:150,name:"Bedroom",open:"goto:9"},{id:"gymdoor",x:200,y:365,w:50,h:30,name:"Gym",open:"goto:12"},{id:"gdoor",x:100,y:365,w:60,h:30,name:"Greyson's",open:"goto:19"}],
[{id:"bed",x:12,y:255,w:215,h:95,name:"Bed",look:"Made this morning. Rare.",push:"Charger, lip balm, kid's sock."},{id:"nightstand",x:232,y:305,w:55,h:60,name:"Nightstand",look:"Book page 12 for 6 months.",open:"Charger #3, melatonin, and a KEY!",hasKey:true},{id:"vanity",x:238,y:205,w:115,h:65,name:"Vanity",look:"Lipstick, mascara, dry shampoo.",use:"Hair ties, bobby pins."},{id:"vmirror",x:258,y:130,w:75,h:65,name:"Mirror",look:"Survived another morning.",talk:"'Have fun, don't die.'"},{id:"window",x:95,y:30,w:115,h:100,name:"Window",look:"Dog is digging again.",open:"'MOM!' from downstairs."},{id:"flowers",x:248,y:190,w:22,h:22,name:"Flowers",look:"Self-care purchase.",take:"Smells nice."},{id:"bdoorL",x:0,y:270,w:14,h:200,name:"Attic",open:"goto:8"},{id:"forestdoor",x:346,y:270,w:14,h:200,name:"Forest's Room",open:"goto:21"}],
[{id:"jcross",x:40,y:45,w:60,h:80,name:"Cross",look:"Holy energy.",talk:"K'Dee prays. Warm light."},{id:"jport",x:182,y:38,w:75,h:95,name:"Jesus Portrait",look:"Kind smile. Halo.",talk:"'Seen my keys?' Smile widens."},{id:"jtub",x:10,y:285,w:178,h:80,name:"Golden Tub",look:"Pure gold. Holy water.",use:"Hand sparkles."},{id:"jbible",x:150,y:225,w:52,h:32,name:"Bible",look:"Proverbs 31.",take:"'Divine guidance.'",quest:"bible"},{id:"jtoilet",x:270,y:305,w:60,h:65,name:"Golden Toilet",look:"Jesus saves, bathroom SPENDS.",use:"Not that throne."},{id:"jcandles",x:315,y:205,w:35,h:38,name:"Candles",look:"Frankincense."},{id:"jdoorB",x:346,y:270,w:14,h:200,name:"Foyer",open:"goto:0"}],
[{id:"penta",x:136,y:416,w:88,h:88,name:"Pentagram",look:"NOT home decor.",use:"Flames flare! Then nothing.",push:"Chalk smudges."},{id:"necro",x:45,y:435,w:42,h:26,name:"Necronomicon",look:"It whispers.",take:"'...return me.'",quest:"necronomicon",talk:"'Keys are not here, mortal.'"},{id:"skull",x:296,y:435,w:22,h:22,name:"Skull",look:"Real or prop?",talk:"'Alas, poor Yorick.'"},{id:"chains",x:10,y:85,w:30,h:120,name:"Chains",look:"Rusty. HISTORY.",use:"Echo: 10/10."},{id:"bstairsU",x:100,y:0,w:160,h:30,name:"Stairs Up",open:"goto:0"},{id:"hgdoor",x:346,y:270,w:14,h:200,name:"Girls' Room",open:"goto:20"}],
[{id:"bench",x:25,y:272,w:120,h:65,name:"Bench Press",look:"Gains.",use:"Half a rep."},{id:"dumbbells",x:160,y:420,w:50,h:22,name:"Dumbbells",look:"Heavy.",take:"Almost lifts one."},{id:"gymmirror",x:85,y:125,w:185,h:115,name:"Mirror",look:"Looking STRONG.",talk:"'Find keys AND look great.'"},{id:"poster",x:278,y:105,w:72,h:55,name:"Poster",look:"NO PAIN NO GAIN."},{id:"pullup",x:262,y:98,w:85,h:55,name:"Pull-Up Bar",use:"3 seconds. Record."},{id:"mat",x:125,y:395,w:105,h:30,name:"Yoga Mat",use:"Namaste."},{id:"gymdoorB",x:0,y:370,w:14,h:150,name:"Attic",open:"goto:8"}],
[{id:"shelves",x:8,y:15,w:344,h:350,name:"Shelves",look:"Expired 2022.",open:"Beans, mystery powder."},{id:"rice",x:276,y:325,w:65,h:45,name:"Rice Bag",look:"50 pounds.",push:"A map drawing!",take:"Too heavy."},{id:"pdoorB",x:0,y:270,w:14,h:200,name:"Kitchen",open:"goto:1"}],
[{id:"breakers",x:136,y:50,w:85,h:80,name:"Breakers",look:"Half tripped.",use:"Lights flicker!"},{id:"washers",x:5,y:195,w:350,h:120,name:"Machines",look:"EIGHT. WHY.",open:"One sock."},{id:"maze1R",x:346,y:270,w:14,h:200,name:"Deeper",open:"goto:15"},{id:"maze1L",x:0,y:270,w:14,h:200,name:"Laundry",open:"goto:6"}],
[{id:"sign",x:55,y:75,w:250,h:42,name:"Sign",look:"YOU ARE HERE... OR ARE YOU?"},{id:"morewash",x:5,y:225,w:350,h:95,name:"More Machines",look:"Laundry DIMENSION.",open:"47 socks. 0 matches."},{id:"maze2R",x:346,y:270,w:14,h:200,name:"Deeper",open:"goto:16"},{id:"maze2L",x:0,y:270,w:14,h:200,name:"Back",open:"goto:14"}],
[{id:"exit",x:126,y:15,w:108,h:32,name:"EXIT",look:"Can you trust it?"},{id:"lint",x:255,y:265,w:70,h:70,name:"Lint Monster",look:"Dryer lint with EYES.",talk:"*rustles*",push:"Reforms. ALWAYS.",use:"Dryer sheet: it HISSES!"},{id:"escape",x:306,y:145,w:45,h:155,name:"Escape Door",open:"goto:6"},{id:"maze3L",x:0,y:270,w:14,h:200,name:"Back",open:"goto:15"}],
[{id:"mower",x:25,y:305,w:80,h:55,name:"Mower",look:"Grass was waist-high.",use:"Pull cord. Nothing."},{id:"tools2",x:145,y:75,w:35,h:265,name:"Tools",look:"Rakes, shovels.",take:"Takes shovel.",quest:"shovel"},{id:"tarp",x:195,y:215,w:125,h:85,name:"Tarp",look:"Something BIG.",push:"Holiday decorations."},{id:"pots",x:255,y:395,w:40,h:35,name:"Pots",look:"Dead plants.",push:"Dirt and regret."},{id:"sheddoorB",x:0,y:370,w:14,h:150,name:"Backyard",open:"goto:7"}],
[{id:"beds",x:10,y:205,w:350,h:82,name:"Garden Beds",look:"Tomatoes, herbs.",take:"Herbs for dinner."},{id:"sunflowers",x:236,y:222,w:118,h:85,name:"Sunflowers",look:"Majestic.",talk:"They lean toward her."},{id:"gnome",x:306,y:405,w:28,h:42,name:"Gnome",look:"Creepy smile. Watching.",talk:"'You know where the keys are.'",push:"Note: CHECK THE COUCH."},{id:"gardendoorB",x:0,y:200,w:14,h:300,name:"Backyard",open:"goto:7"}],
[{id:"gpc",x:85,y:135,w:190,h:95,name:"Gaming PC",look:"Triple monitors. RGB.",use:"Game unpauses. Panic.",talk:"Discord tab closed."},{id:"gchair",x:125,y:285,w:110,h:55,name:"Chair",look:"Cost more than couch.",use:"Comfortable."},{id:"gposter1",x:10,y:90,w:60,h:42,name:"Cyberpunk",look:"Thinks he's a hacker."},{id:"gposter2",x:286,y:85,w:60,h:46,name:"Anime",look:"Nods approvingly."},{id:"drinks",x:258,y:385,w:40,h:25,name:"Energy Drinks",look:"Three empty. 3AM gaming.",take:"Confiscated."},{id:"board",x:296,y:425,w:48,h:12,name:"Skateboard",use:"Slides 3 feet. Regret."},{id:"groomdoorB",x:0,y:370,w:14,h:150,name:"Attic",open:"goto:8"}],
[{id:"hbed",x:5,y:265,w:128,h:80,name:"Holly's Bed",look:"Animals by SIZE.",open:"Diary. Privacy respected."},{id:"gwbed",x:140,y:265,w:128,h:80,name:"Gwyn's Bed",look:"Books on pillow.",open:"'Reading is my superpower.'"},{id:"hgvanity",x:272,y:145,w:80,h:70,name:"Vanity",look:"Lip gloss rivals Sephora.",use:"Borrows some. Shhh."},{id:"fairy",x:0,y:18,w:360,h:28,name:"Fairy Lights",look:"Magical.",use:"Disco mode."},{id:"stuffed",x:296,y:405,w:42,h:28,name:"Stuffed Animals",look:"Pink bunny, brown bear.",talk:"Mr. Bun-Bun knows nothing."},{id:"art",x:35,y:50,w:60,h:50,name:"Sisters Art",look:"Crayon sisters. Hearts. K'Dee tears up."},{id:"hgroomdoorB",x:0,y:370,w:14,h:150,name:"Basement",open:"goto:11"}],
[{id:"fbed",x:25,y:265,w:195,h:90,name:"Forest's Bed",look:"Pale. Barely moving.",talk:"'...tired, mom.' Heart breaks."},{id:"fthermo",x:115,y:245,w:12,h:24,name:"Thermometer",look:"102.3. High fever.",take:"Still high."},{id:"fmeds",x:236,y:345,w:65,h:30,name:"Medicine",look:"Tylenol, cough syrup.",use:"Next dose in 2 hours."},{id:"fcard",x:286,y:145,w:48,h:42,name:"Get Well Card",look:"From sisters. Hearts."},{id:"fhumid",x:266,y:395,w:32,h:32,name:"Humidifier",look:"Gently humming.",use:"More mist."},{id:"fwindow",x:175,y:50,w:95,h:80,name:"Window",look:"Dark curtains.",open:"Thin beam of light."},{id:"froomdoorB",x:0,y:270,w:14,h:200,name:"Bedroom",open:"goto:9"}]
];}
