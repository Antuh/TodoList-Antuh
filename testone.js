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
    let selectedStatus = '';
  
    select.addEventListener('change', function() {
      selectedStatus = select.value;
    });
  
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
  
      fetch("http://localhost:8082/databases/TodoListDatabase/docs?id=" + randomId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (response.ok) {
          console.log(response.responseText);
        }
      })
      .catch(error => {
        console.error(error);
      });
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
  
  function changeTask(id) {
    const requestUrl = `http://localhost:8082/databases/TodoListDatabase/docs?id=${id}`;
    fetch(requestUrl)
      .then(response => response.json())
      .then(data => {
        const modal = document.createElement('div');
        modal.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5);'
        const modalContent = document.createElement('div');
        modalContent.style = 'background-color: white; width: 500px; height: 400px; margin: 100px auto; padding: 20px;';
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style = 'position: absolute; top: 10px; right: 10px; font-size: 20px; font-weight: bold; border: none; background-color: white; cursor: pointer;';
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
  
        const titleInput = document.createElement('input');
        titleInput.value = data.text;
        modalContent.appendChild(document.createTextNode('Наименование: '));
        modalContent.appendChild(titleInput);
        modalContent.appendChild(document.createElement('br'));
  
        const priorityInput = document.createElement('select');
        priorityInput.innerHTML = `
          <option value="6" ${data.priority === '6' ? 'selected' : ''}>Высокий</option>
          <option value="5" ${data.priority === '5' ? 'selected' : ''}>Средний</option>
          <option value="4" ${data.priority === '4' ? 'selected' : ''}>Низкий</option>
        `;
        modalContent.appendChild(document.createTextNode('Приоритет: '));
        modalContent.appendChild(priorityInput);
        modalContent.appendChild(document.createElement('br'));
  
        const statusInput = document.createElement('select');
        statusInput.innerHTML = `
          <option value="Новая" ${data.status === 'Новая' ? 'selected' : ''}>Новая</option>
          <option value="В работе" ${data.status === 'В работе' ? 'selected' : ''}>В работе</option>
          <option value="Завершена" ${data.status === 'Завершена' ? 'selected' : ''}>Завершена</option>
        `;
        modalContent.appendChild(document.createTextNode('Статус: '));
        modalContent.appendChild(statusInput);
        modalContent.appendChild(document.createElement('br'));
  
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Изменить';
        modalContent.appendChild(updateButton);
  
        updateButton.addEventListener('click', () => {
          const updatedData = {
            text: titleInput.value,
            priority: priorityInput.value,
            status: statusInput.value
          };
  
          fetch(requestUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
          })
          .then(response => {
            if (response.ok) {
              document.body.removeChild(modal);
              const currentRow = document.getElementById(id);
              currentRow.cells[0].innerHTML = updatedData.text;
              currentRow.cells[1].innerHTML = updatedData.priority;
              currentRow.cells[2].innerHTML = updatedData.status;
            } else {
              throw new Error('Ошибка при изменении задачи');
            }
          })
          .catch(error => {
            console.error(error);
            alert('Ошибка при изменении задачи');
          });
        });
  
        closeButton.addEventListener('click', () => {
          document.body.removeChild(modal);
        });
      })
      .catch(error => {
        console.error(error);
        alert('Ошибка при загрузке задачи');
      });
  }
  
  function fetchData() {
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
      const changeHeader = headerRow.insertCell(4);
  
      nameHeader.innerHTML = '<b>Наименование</b>';
      priorityHeader.innerHTML = '<b>Приоритет</b>';
      statusHeader.innerHTML = '<b>Статус</b>';
      deleteHeader.innerHTML = '<b>Действие</b>';
      changeHeader.innerHTML = '<b>Действие</b>';
  
      for (let i = 0; i < data.Results.length; i++) {
        const row = table.insertRow();
        const idCell = row.insertCell(0);
        const nameCell = row.insertCell(1);
        const priorityCell = row.insertCell(2);
        const statusCell = row.insertCell(3);
        const deleteCell = row.insertCell(4);
        const changeCell = row.insertCell(5);
  
        idCell.innerHTML = data.Results[i]['@metadata']['@id'];
        nameCell.innerHTML = data.Results[i].text;
        priorityCell.innerHTML = data.Results[i].priority;
        statusCell.innerHTML = data.Results[i].status;
  
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteCell.appendChild(deleteButton);
  
        deleteButton.addEventListener('click', () => {
          const taskId = data.Results[i]['@metadata']['@id'];
          deleteTask(taskId);
        });
  
        const changeButton = document.createElement('button');
        changeButton.textContent = 'Изменить';
        changeCell.appendChild(changeButton);
  
        changeButton.addEventListener('click', () => {
          const taskId = data.Results[i]['@metadata']['@id'];
          changeTask(taskId);
        });
      }
    })
    .catch(error => {
      console.error(error);
    });
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    AddData();
    fetchData();
  });
  