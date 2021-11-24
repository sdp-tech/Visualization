// primarySector가 바뀌면 subsector option 값 변경
const selectOnChange = () => {
  const value = document.getElementById('primarySector').value;
  if (value === 'not select') {
    const subsectorElement = document.getElementById('subsector');
    subsectorElement.innerHTML = '';
    const option = document.createElement('option');
    option.value = null;
    option.text = 'not select';
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
      const subsectorElement = document.getElementById('subsector');
      console.log(subsector);
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

// Search시 구현해야하는 함수.
const onClickHandler = () => {
  alert('구현해야합니다..');
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
};

document.addEventListener('DOMContentLoaded', () => {
  selectOnChange();
});
