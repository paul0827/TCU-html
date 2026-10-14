const team=[
{id:'liu',name:'劉怡均',title:'教授',role:'研究中心主持人',english:'Liu, Ingrid Y.C. Ph.D.',image:'team-liu.jpg',phone:'+886-3-8565301',dial:'+88638565301',ext:'11002',email:'ycliu@gms.tcu.edu.tw',sections:[
{title:'職務',items:['慈濟大學校長','慈濟大學醫學科學研究所教授']},
{title:'學歷',items:['美國南加州大學（USC）神經科學研究所博士','美國印地安那大學微生物學碩士','國立臺灣大學植病學系學士']},
{title:'經歷',items:['慈濟大學副校長（2017/8–2019/7）','慈濟大學教務長（2014/9–2017/7）','慈濟大學教師發展暨教學資源中心主任（2013/8–2019/7）']},
{title:'學術專長',items:['阿茲海默症之早期偵測及治療','行為神經學','神經遺傳學','細胞遺傳學']} ]},
{id:'cheng',name:'鄭凱文',title:'助理教授',role:'核心研究員暨執行團隊',english:'Kai-Wen Cheng, Ph.D. (Religious Studies)',image:'team-cheng.png',phone:'+886-3-8572677',dial:'+88638572677',ext:'5870 / 5871',email:'kevin0512@gms.tcu.edu.tw',sections:[
{title:'職務',items:['慈濟學教學研究中心助理研究員（Assistant Research Fellow）','通識教育中心兼任助理教授（具教育部助理教授證書）']},
{title:'學歷',items:['國立政治大學宗教學博士']},
{title:'經歷',items:['全球永續發展目標教研總中心／慈濟學教學研究中心專任助理研究員','慈濟學教學研究中心執行秘書','2021–2024 慈濟學研究計畫主持人','慈濟大學通識課程「認識生活中的宗教文化藝術」、「音樂、電影與信仰」授課教師','科技部獎勵人文與社會科學領域博士候選人撰寫博士論文獲獎人','財團法人聖嚴教育基金會「漢傳佛教」獎學金獲獎人','陽明大學核心通識「伊斯蘭文明與思想」跨校教學助教','政治大學核心通識「生命探索與宗教文化」特優教學助教','法務部立德電臺「清淨的智慧」廣播節目主持人（心靈勵志類）','慈濟傳播人文志業基金會中文期刊部《慈濟月刊》專任編輯']},
{title:'學術專長',items:['宗教學、宗教史、宗教文化與藝術、宗教人物與教團','宗教跨領域研究、全球跨信仰交流合作、宗教與社會、宗教與科技（AI 新議題）','佛教學、漢傳佛教（歷史與近現代發展）、人間佛教、經典詮釋','慈濟學、慈濟史、證嚴法師思想與慈濟宗研究、法華三部《無量義經》、人間菩薩與當代實踐']},
{title:'開設課程',items:['認識生活中的宗教文化藝術（110–114學期）','音樂、電影與信仰（110–114學期）']} ]}
];
const books=[
{n:'002',title:'為佛教 為眾生',sub:'廣行慈濟',cat:'思想',image:'book-0.jpg',theme:'思想與實踐',direction:'從「為佛教、為眾生」的命題出發，思考思想與社會實踐之間的連結。'},
{n:'003',title:'慈濟慈善志業',sub:'洪注大乘 · 潤漬眾生',cat:'四大志業',image:'book-1.png',theme:'慈善與關懷',direction:'以慈善志業為閱讀起點，關注關懷、互助與人群之間的關係。'},
{n:'004',title:'慈濟醫療志業',sub:'救處護處 · 大依止處',cat:'四大志業',image:'book-2.png',theme:'醫療與生命',direction:'從醫療志業出發，思考生命照護與人文關懷。'},
{n:'005',title:'慈濟教育志業',sub:'曉了分別 · 性相真實',cat:'四大志業',image:'book-3.png',theme:'教育與傳承',direction:'以教育志業為起點，探索知識、價值與人才培育的關係。'},
{n:'006',title:'慈濟人文志業',sub:'法音宣流 · 大愛清流',cat:'四大志業',image:'book-4.png',theme:'人文與傳播',direction:'從人文志業的視角，思考文化表達、傳播與社會的連結。'},
{n:'007',title:'慈濟急難賑災',sub:'無量大悲 · 救苦眾生',cat:'社會實踐',image:'book-5.png',theme:'急難與援助',direction:'以急難賑災為主題，關注災難中的援助、關懷與回應。'},
{n:'008',title:'慈濟大捨捐贈',sub:'頭目髓腦 · 悉施於人',cat:'社會實踐',image:'book-6.png',theme:'捐贈與付出',direction:'從捐贈與付出的主題出發，思考生命、利他與社會實踐。'},
{n:'009',title:'慈濟社區志工',sub:'布善種子 · 遍功德田',cat:'社會實踐',image:'book-7.png',theme:'社區與志願服務',direction:'從社區志工的行動出發，理解日常關懷、社區參與與人際連結。'},
{n:'010',title:'慈濟環境保護',sub:'扇解脫風 · 除世熱腦',cat:'生活與環境',image:'book-8.png',theme:'環境與永續',direction:'以環境保護為閱讀起點，關注生活選擇、環境責任與永續行動。'},
{n:'011',title:'黃土高坡愛永續',sub:'',cat:'社會實踐',image:'book-9.png',theme:'關懷與延續',direction:'以「愛永續」為線索，思考關懷如何延續，以及人與土地的關係。'},
{n:'012',title:'腸樂我淨',sub:'素無量心',cat:'生活與環境',image:'book-10.png',theme:'飲食與生活',direction:'從飲食與生活的角度，探索個人選擇、健康與關懷。'}
];
const spaces=[
{image:'space-full-0.jpg',name:'想師館',caption:'想師館 · 入口與閱讀空間'},
{image:'space-full-1.png',name:'想師館',caption:'想師館 · 交流座席'},
{image:'space-full-2.jpg',name:'佛學參考區',caption:'佛學參考區 · 竹木書架與閱讀座席'},
{image:'space-full-3.png',name:'教案研討室',caption:'教案研討室'},
{image:'space-full-4.jpg',name:'史料典藏館',caption:'史料典藏館 · 典藏空間'},
{image:'space-full-5.jpg',name:'史料典藏館',caption:'史料典藏館 · 文獻展示'},
{image:'space-full-6.jpg',name:'史料典藏館',caption:'史料典藏館 · 資料展示'},
{image:'space-full-7.jpg',name:'史料典藏館',caption:'史料典藏館 · 典藏展示'}
];
