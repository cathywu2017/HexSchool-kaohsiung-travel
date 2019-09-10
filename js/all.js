var changeArea = document.querySelector('.changeArea');
var areaTitle = document.querySelector('.areaTitle');
var areaBox = document.querySelector('.areaBox');
var pageBox = document.querySelector('.pageBox');
var page = document.querySelector('.page');
var hot = document.querySelector('.hot');

var selectList;
var currentPage; //目前頁面
var perPage = 4; //每頁4個
var totalPage; //全部頁碼

var dataStr;
var data;
var dataLen;

var xhr = new XMLHttpRequest();
xhr.open('get','https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97',true);
xhr.send();
xhr.onload = function() {
    if(xhr.readyState ==4 && xhr.status == 200) {
        xhrFun();    
        presetData();
    }else {
        alert('資料讀取失敗!');
    }
    
}

function xhrFun() {
    dataStr = JSON.parse(xhr.responseText);
    data = dataStr.result.records;
    dataLen = data.length;    
    //撈出 data 的所有行政區    
    var dataZone = [];
    for(var i=0;i<dataLen;i++) {
        // console.log(data[i].Zone);
        dataZone.push(data[i].Zone);    
    }

    //過濾 dataZone 重覆的行政區
    var zoneList = [];
    dataZone.forEach(function(value){
        if(zoneList.indexOf(value) == -1) {
            zoneList.push(value);
        }
    })

    //將 zoneList 行政區加入 select 選單中
    for(var i=0;i<zoneList.length;i++) {
        var option = document.createElement('option');
        option.textContent = zoneList[i];
        // console.log(option);
        changeArea.appendChild(option);    
    }
}   
    
    
//產生新陣列 - 各行政區的資料
function newData(value) {
    selectList = [];
    for(var i=0;i<data.length;i++) {
        if(data[i].Zone == value) {
            selectList.push(data[i]); //如果點選中的值等於data的Zone，將選定的行政區內資料產生成新的陣列 selectList
        }
    }
    // console.log(selectList);
}

//切換 select
function changeAreaFun(e) {  
    var value = e.target.value;
    newData(value); //各行政區的資料
    currentPage = 1; //每次切換 select 時，讓 currentPage 預設為1    
    pagination();
    upData();
}

//熱門行政區
function hotFun(e) {
    var value = e.target.textContent;
    newData(value); //各行政區的資料
    currentPage = 1; //讓 currentPage 預設為1    
    pagination();
    upData();
}

//預設一開始載入畫面
function presetData() {
    newData('三民區'); 
    // console.log(selectList);
    currentPage = 1; //讓 currentPage 預設為1    
    pagination();
    upData();    
}


//生成畫面
function upData(){
    var selectListLen = selectList.length;
    var content = '';
    if(selectListLen !== 0) {
        changeArea.children[0].setAttribute('disabled','disabled'); //讓'請選擇行政區'變成無法點選
        for(var i=0;i<selectListLen;i++) {
            areaTitle.innerHTML = selectList[i].Zone;
            content += '<li ';
            if(i< (currentPage-1) * perPage || i >= currentPage * perPage) {
                //currentPage=1(<0||>=4) i=0123-false / i=4-11(>=4)-true-加上none
                //currentPage=2(<4||>=8) i=4567-false / i=0-3(<4).i=8-11(>=8)-true-加上none
                //currentPage=3(<8||>=12)) i=891011-false / i=0-7(<8)-true-加上none
                content += 'style="display:none"'
            }
            content += '>'; 
            content += `
                <div class="img">
                    <img src="${selectList[i].Picture1}">
                    <div class="name">
                        <p>${selectList[i].Name}</p>
                        <p>${selectList[i].Zone}</p>
                    </div>
                </div>
                <div class="infoBox">
                    <div class="add">${selectList[i].Add}</div>
                    <div class="tel">${selectList[i].Tel}</div>
                    <div class="openTime">${selectList[i].Opentime}</div>
                </div>
            </li>`
        }
        areaBox.innerHTML = content;
    }
    // console.log(currentPage);
    // console.log(totalPage);
    if(currentPage == 1) {
        document.querySelector('.prevBtn').classList.add('disabled');
        // console.log(currentPage);
    }else {
        document.querySelector('.prevBtn').classList.remove('disabled');
    }
    if(currentPage == totalPage) {
        document.querySelector('.nextBtn').classList.add('disabled');
        // console.log(currentPage);
    }else {
        document.querySelector('.nextBtn').classList.remove('disabled');
    }
}

//產生分頁
function pagination() {
    totalPage = Math.ceil(selectList.length / perPage); //全部頁碼
    // console.log(totalPage);
    var str = '';
    for(var i=0; i<totalPage; i++) {
        str += '<li onclick=changePage('+ (i+1) +')>'+(i+1)+'</li>';
    }
    page.innerHTML = str;
    page.children[0].classList.add('active');

    // var btnPrevAndNext = document.querySelector('.prevBtn') && document.querySelector('.nextBtn'); //不能這樣寫，只會讀到一個
    if(totalPage > 0) {
        pageBox.style.display = 'flex';
    }
}

//切換上下一頁
function prevOrNext(e) {    
    if(e.target.tagName !== "DIV") {
        return;
    }
    if(e.target.className == 'prevBtn') {
        if(currentPage > 1 && currentPage <= totalPage) { 
            currentPage--;
            // console.log(currentPage);
        }
    }
    if(e.target.className == 'nextBtn') {
        if(currentPage >= 1 && currentPage < totalPage) {
            currentPage++;
            // console.log(currentPage);
        }
    }
    changePage(currentPage);
}




changeArea.addEventListener('change',changeAreaFun);
pageBox.addEventListener('click',prevOrNext);
hot.addEventListener('click',hotFun);


//滑動出現回到最上按鈕
window.onscroll = function() {
    var goTop = document.querySelector('.goTop');
    var t = document.body.scrollTop || document.documentElement.scrollTop;
    if(t > 100) {
        goTop.style.opacity = 1;
    }else {
        goTop.style.opacity = 0;
    }
}
//分頁加上 .active
function changePage(num) {   
    // console.log('a');
    //清除預設和新加上的active
    for(var i=0;i<totalPage; i++) {
        page.children[i].classList.remove('active');
    }
    
    if(currentPage !== num) {
        // console.log('a');        
        currentPage = num;   
        // page.children[(num-1)].classList.add('active');        
    }
    // else {
        // console.log('b');
        // page.children[(num-1)].classList.add('active');  
    // }  
    page.children[(num-1)].classList.add('active');  
    upData();
}