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
  
    button.addEventListener('click', function() {
      fetch('http://localhost:8082/databases/TodoListDatabase/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({ Query: 'from task order by priority desc limit 1' }),
      })
        .then(response => response.json())
        .then(data => {
          let priority = 1;
          if(data.Results.length > 0) {
            priority = parseInt(data.Results[0].priority) + 1;
          }
          let dataToAdd = {
            "text": input.value,
            "status": "Активно",
            "priority": priority.toString(),
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
            body: JSON.stringify(dataToAdd)
          })
            .then(response => {
              if (response.ok) {
                console.log(response.responseText);
              }
            })
            .catch(error => {
              console.error(error);
            });
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
          <option value="6" ${data.priority === '1' ? 'selected' : ''}>Высокий</option>
          <option value="5" ${data.priority === '2' ? 'selected' : ''}>Средний</option>
          <option value="4" ${data.priority === '3' ? 'selected' : ''}>Низкий</option>
        `;
        modalContent.appendChild(document.createTextNode('Приоритет: '));
        modalContent.appendChild(priorityInput);
        modalContent.appendChild(document.createElement('br'));
  
        const statusInput = document.createElement('select');
        statusInput.innerHTML = `
          <option value="Активно" ${data.status === 'Активно' ? 'selected' : ''}>Активно</option>
          <option value="Выполнено" ${data.status === 'Выполнено' ? 'selected' : ''}>Выполнено</option>
        `;
        modalContent.appendChild(document.createTextNode('Статус: '));
        modalContent.appendChild(statusInput);
        modalContent.appendChild(document.createElement('br'));
  
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Изменить';
        modalContent.appendChild(updateButton);
  
        updateButton.addEventListener('click', () => {
          const updatedData = {
            "text": titleInput.value,
            "priority": priorityInput.value,
            "status": statusInput.value,
            "@metadata": {
                "@collection": "task"
            }
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
  
  function fetchData(id) {
    let query;
  
    if (id === 'active-sort') {
      query = 'from task where status = "Активно"';
    } else {
      if(id === 'complete-sort') {
        query = 'from task where status = "Выполнено"';
      }
      else{
        query = 'from task';
      }
    }
  
    fetch('http://localhost:8082/databases/TodoListDatabase/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({ Query: query }),
    })
      .then(response => response.json())
      .then(data => {
        const table = document.getElementById('data');
        table.innerHTML = '';
  
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
        //const idCell = row.insertCell(0);
        const nameCell = row.insertCell(0);
        const priorityCell = row.insertCell(1);
        const statusCell = row.insertCell(2);
        const deleteCell = row.insertCell(3);
        const changeCell = row.insertCell(4);
  
        //idCell.innerHTML = data.Results[i]['@metadata']['@id'];
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
  
  const exportJsonButton = document.getElementById('export-json');
  exportJsonButton.addEventListener('click', exportToJson);
  const exportTsvButton = document.getElementById('export-tsv');
  exportTsvButton.addEventListener('click', exportToTsv);
  
  function exportToJson() {
    const data = fetchDataResult();
    const jsonData = JSON.stringify(data);
    downloadFile(jsonData, 'todo-list.json', 'application/json');
  }
  
  function exportToTsv() {
    const data = fetchDataResult();
    const tsvData = convertToTsv(data);
    downloadFile(tsvData, 'todo-list.tsv', 'text/tab-separated-values');
  }
  
  function fetchDataResult() {
    const table = document.getElementById('data');
    const data = [];
  
    for (let i = 1; i < table.rows.length; i++) {
      const task = {};
      task.text = table.rows[i].cells[0].innerText;
      task.priority = table.rows[i].cells[1].innerText;
      task.status = table.rows[i].cells[2].innerText;
      data.push(task);
    }
  
    return data;
  }
  
  function convertToTsv(data) {
    const header = Object.keys(data[0]).join('\t');
    const rows = data.map(task => Object.values(task).join('\t'));
    return `${header}\n${rows.join('\n')}`;
  }
  
  function downloadFile(data, filename, type) {
    const file = new Blob([data], { type });
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    AddData();
    fetchData();
  });