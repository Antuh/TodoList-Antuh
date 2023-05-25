fetchData();
AddData();

function generateRandomString(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function AddData() {
  let input = document.querySelector('#todoInput');
  let button = document.querySelector('#submit');
  let xhr = new XMLHttpRequest();

  button.addEventListener('click', function() {
    let data = {
      "text": input.value,
      "priority": "6",
    "@metadata": {
        "@collection": "task"
    }
    };
    
    let randomId = generateRandomString(8);
    
    xhr.open("PUT", "http://localhost:8082/databases/TodoListDatabase/docs?id=" + randomId);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(xhr.responseText);
      }
    };
    
    xhr.send(JSON.stringify(data));
  });
    
}

function fetchData() {
  let request = new XMLHttpRequest();
  request.open("POST", "http://localhost:8082/databases/TodoListDatabase/queries");
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status === 200) {
      console.log(request.responseText);
    }
  };
  let data = {
    "Query": "from task"
  };
  request.send(JSON.stringify(data));
  request.onload = function() {
      if (request.status === 200) {
        var data = JSON.parse(request.responseText);
  
        var table = document.getElementById('data');
  
        var headerRow = table.insertRow();
        var idHeader = headerRow.insertCell(0);
        var nameHeader = headerRow.insertCell(1);
        var priorityHeader = headerRow.insertCell(2);
        
        //idHeader.innerHTML = "<b>Идентификатор</b>";
        nameHeader.innerHTML = "<b>Наименование</b>";
        priorityHeader.innerHTML = "<b>Приоритет</b>";
        
  
        data.Results.forEach(function(item) {
          var row = table.insertRow();
          var idCell = row.insertCell(0);
          var nameCell = row.insertCell(1);
          var priorityCell = row.insertCell(2);
          //idCell.innerHTML = item['@metadata']['@id'];
          //idCell.innerHTML = item['@metadata']['@id'];
          nameCell.innerHTML = item['text'];
          priorityCell.innerHTML = item['priority'];
        });
      } else {
        // Обработка ошибки
      }
    };
}