// primarySector가 바뀌면 subsector option 값 변경
const selectOnChange = () => {
  const value = document.getElementById('primarySector').value;
  if (value === 'not select') {
    const subsectorElement = document.getElementById('subSector');
    subsectorElement.innerHTML = '';
    const option = document.createElement('option');
    option.value = null;
    option.text = 'not selected';
    subsectorElement.appendChild(option);
    return;
  }
  const url = 'apis/criteria';

  $.ajax({
    dataType: 'json',
    // crossDomain: true,
    url: url,
    cache: false,
    headers: {
      'X-Requested-With': 'XMLHttpRequest', 
    },

    success: function (res) {
      const subsector = res.sector[value];
      const subsectorElement = document.getElementById('subSector');
      subsectorElement.innerHTML = '';

      for (const sub of subsector) {
        const option = document.createElement('option');
        option.value = sub;
        option.text = sub;
        subsectorElement.appendChild(option);
      }
    },
    error: function (err) {
      console.log('ERR', err);
    },
  });
};

// Search 기능을 위한 함수
/* 
!TODO
1. apis/data에 GET 요청 보내기 ( jquery의 ajax를 사용하거나, 더 편리하게 사용하려면 axios 사용하면 됩니다. )
  ex) GET /apis/search?name=test&&ppi_status=Delayed&&sector=Energy&&subsector=Electricity&&income_group=Low income
2. 보낼 때 query parameter를 option과 input 값(project name)을 통해 전달.
3. 만약 not selected거나, input value가 ''이면 보내지 않기.
4. query parameter는 아래의 5개를 선택적으로 보내야 함. 모두 필수가 아님. ( 3에서 언급했듯이 선택하지 않으면 안보내기.. )
  name : "test" // project name
  ppi_status : "Delayed" // status
  sector : "Energy" // primary sector
  subsector : "Electricity" // sub sector
  income_group: "Low income" // income group
5. 그 후 get 요청을 통해 가져온 값을 보여주기..
*/
const onClickHandler = () => {  
  const nameEl = document.getElementById('projectName');
  const incomeEl = document.getElementById('incomeGroup');
  const statusEl = document.getElementById('status');
  const prsectorEl = document.getElementById('primarySector');
  const sbsectorEl = document.getElementById('subSector');

  if(nameEl.value === '' && incomeEl.value === 'not select' && statusEl.value === 'not select' && prsectorEl.value === 'not select'){
    alert('검색 항목을 하나 이상 체크해주세요');
    return;
  }

  const parms = {};
  if(nameEl.value !== '')
    parms['name'] = nameEl.value;
  if(incomeEl.value !== 'not select')
    parms['income_group'] = incomeEl.value;
  if(statusEl.value !== 'not select')
    parms['ppi_status'] = statusEl.value;
  if(prsectorEl.value !== 'not select'){
    parms['sector'] = prsectorEl.value;
    parms['subsector'] = sbsectorEl.value;
  }

  $.ajax({
    type: 'GET',
    url: 'apis/search',
    dataType: 'json',
    cach: false,
    data: parms,
    headers: {
      'X-Requested-With': 'XMLHttpRequest', 
    },
    // 받아온 데이터랑 현재 예시 테이블 항목들이랑 좀 다른 요소, 값들이 많음
    // 일단 가지고 있는 데이터에 맞춰서 테이블 항목 변경하긴 하는데 이후 논의 필요
    success: function(res) {
      const tableEl = document.getElementById("resultTable");
      const tableList = ['select', 'country', 'geographical', 'sector', 'subsector', 'project_name', 'fc_year', 'urls'];

      while(tableEl.children.length !== 1){
        tableEl.removeChild(tableEl.lastChild);
      }
      
      for(const item of res){
        const trEl = document.createElement('tr');
        for(lst of tableList){
          let tdEl = document.createElement('td');
          tdEl.style = 'text-align:center';
          tdEl.className = lst;
      
          if(lst ==='select'){
            let inputEl = document.createElement('input');
            inputEl.type = 'checkbox';
            inputEl.style = 'zoom: 1.3';
            inputEl.className = 'cmpCheckbox';
            tdEl.appendChild(inputEl);
          }
          else if(lst === 'country')
            tdEl.textContent = item.properties[lst][0];
          else if(lst === 'urls'){
            var aEl = document.createElement('a');
            aEl.href = item.properties[lst];
            aEl.textContent = 'Link';
            // aEl.textContent = item.properties[lst];
            tdEl.appendChild(aEl);
          }
          else
            tdEl.textContent = item.properties[lst];
          trEl.appendChild(tdEl);
        }
        tableEl.appendChild(trEl);
      }

      var cmpacc = document.getElementById("cmpaccordion");
      var panel = cmpacc.nextElementSibling;
      if(tableEl.children.length === 1){
        cmpacc.classList.add("active");
        panel.style.maxHeight = null;        
      }
      else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }

      cmpacc.textContent = 'Search Results (' + (tableEl.children.length-1).toString() + ')';
    }
  })
};

// Compare 기능을 위한 함수
// 세부적인 디테일한 자료 비교가 가능한 방향으로 개선 필요 현재는 단순히 테이블 tarnspose 기능 정도 느낌
const compareOnClick = () => {

  const checkEls = document.getElementsByClassName("cmpCheckbox");
  
  const tableList = ['country', 'geographical', 'sector', 'subsector', 'project_name', 'fc_year', 'urls'];
  for(lst of tableList){
    let container = document.getElementById(lst);
    while(container.children.length !== 1){
      container.removeChild(container.lastChild);
    }
  }
  
  for(checkEl of checkEls){
    if(checkEl.checked){
      const sibs = $(checkEl).parent().siblings();

      for(sib of sibs){
        let container = document.getElementById(sib.className);
        let tdEl = document.createElement('td');
        tdEl.style = 'text-align:center';
        if(sib.className === 'urls'){
          var aEl = document.createElement('a');
          aEl.href = sib.children[0].href;
          aEl.textContent = sib.children[0].href;
          // aEl.textContent = item.properties[lst];
          tdEl.appendChild(aEl);
          tdEl.style = 'overflow:hidden; width: 20px';
          
        }else
          tdEl.textContent = sib.textContent;
        container.appendChild(tdEl);
      }
    }
  }
};


document.addEventListener('DOMContentLoaded', () => {
  selectOnChange();
});