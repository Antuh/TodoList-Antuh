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
  const select = document.getElementById('status');
  let selectedStatus = ''; // объявляем переменную для выбранного статуса

  select.addEventListener('change', function() {
    selectedStatus = select.value; // записываем значение выбранного статуса в переменную
  });
  let xhr = new XMLHttpRequest();

  button.addEventListener('click', function() {
    let data = {
      "text": input.value,
      "status": selectedStatus,
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

function deleteTask(id) {
  fetch(`http://localhost:8082/databases/TodoListDatabase/docs?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  })
    .then(response => {
      if (response.ok) {
        const rows = document.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row.firstChild.textContent === id) {
            row.parentNode.removeChild(row);
            break;
          }
        }
      } else {
        console.error(`Ошибка удаления документа с id ${id}`);
      }
    })
    .catch(error => {
      console.error(`Ошибка удаления документа с id ${id}`, error);
    });
}

function fetchData(id) {
fetch('http://localhost:8082/databases/TodoListDatabase/queries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  body: JSON.stringify({ Query: 'from task' }),
})
  .then(response => response.json())
  .then(data => {
    const table = document.getElementById('data');
    const headerRow = table.insertRow();
    const nameHeader = headerRow.insertCell(0);
    const priorityHeader = headerRow.insertCell(1);
    const statusHeader = headerRow.insertCell(2);
    const deleteHeader = headerRow.insertCell(3);

    nameHeader.innerHTML = '<b>Наименование</b>';
    priorityHeader.innerHTML = '<b>Приоритет</b>';
    statusHeader.innerHTML = '<b>Статус</b>';
    deleteHeader.innerHTML = '<b>Действие</b>';

    data.Results.forEach(function(item) {
      const row = table.insertRow();
      const nameCell = row.insertCell(0);
      const priorityCell = row.insertCell(1);
      const statusCell = row.insertCell(2);
      const deleteCell = row.insertCell(3);

      nameCell.innerHTML = item['text'];
      priorityCell.innerHTML = item['priority'];
      statusCell.innerHTML = item['status'];
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Удалить';
      deleteButton.addEventListener('click', function() {
        deleteTask(item['@metadata']['@id']);
      });
      deleteCell.appendChild(deleteButton);
    });
  });
}