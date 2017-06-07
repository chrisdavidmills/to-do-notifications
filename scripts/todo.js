const note = document.getElementById('notifications');
let db;

const newItem = [
      { taskTitle: "", hours: 0, minutes: 0, day: "", month: "", year: 0, passed: "" }
    ];
    
const increment = 0;

const taskList = document.getElementById('task-list');

const taskForm = document.getElementById('task-form');
const title = document.getElementById('title');

const hours = document.getElementById('deadline-hours');
const minutes = document.getElementById('deadline-minutes');
const day = document.getElementById('deadline-day');
const month = document.getElementById('deadline-month');
const year = document.getElementById('deadline-year');

const submit = document.getElementById('submit');

window.onload = () => {
  note.innerHTML += '<li>App initialised.</li>';
  // In the following line, you should include the prefixes of implementations you want to test.
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  // DON'T use "var indexedDB = ..." if you're not in a function.
  // Moreover, you may need references to some window.IDB* objects:
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)


  // Let us open our database
  const request = window.indexedDB.open("toDoList", 4);

  // these two event handlers act on the database being opened successfully, or not
  request.onerror = event => {
    note.innerHTML += '<li>Error loading database.</li>';
  };
  
  request.onsuccess = event => {
    note.innerHTML += '<li>Database initialised.</li>';
    db = request.result;
    displayData(db);
  };
  
  // This event handles the event whereby a new version of the database needs to be created
  // Either one has not been created before, or a new version number has been submitted via the
  // window.indexedDB.open line above
  //it is only implemented in recent browsers
  request.onupgradeneeded = event => { 
    const db = event.target.result;
    
    db.onerror = event => {
      note.innerHTML += '<li>Error loading database.</li>';
    };

    // Create an objectStore for this database
    
    const objectStore = db.createObjectStore("toDoList", { keyPath: "taskTitle" });
    
    // define what data items the objectStore will contain
    
    objectStore.createIndex("hours", "hours", { unique: false });
    objectStore.createIndex("minutes", "minutes", { unique: false });
    objectStore.createIndex("day", "day", { unique: false });
    objectStore.createIndex("month", "month", { unique: false });
    objectStore.createIndex("year", "year", { unique: false });
    
    objectStore.createIndex("passed", "passed", { unique: false });
    
    note.innerHTML += '<li>Object store created.</li>';
  };
    
  function displayData() {
    taskList.innerHTML = "";
  
    
    const objectStore = db.transaction('toDoList').objectStore('toDoList');
    objectStore.openCursor().onsuccess = event => {
      const cursor = event.target.result;
        if(cursor) {
          const listItem = document.createElement('li');
          
          if(cursor.value.day == 1 || cursor.value.day == 21 || cursor.value.day == 31) {
            daySuffix = "st";
          } else if(cursor.value.day == 2 || cursor.value.day == 22) {
            daySuffix = "nd";
          } else if(cursor.value.day == 3 || cursor.value.day == 23) {
            daySuffix = "rd";
          } else {
            daySuffix = "th";  
          }
          
          listItem.innerHTML = `${cursor.value.taskTitle} — ${cursor.value.hours}:${cursor.value.minutes}, ${cursor.value.month} ${cursor.value.day}${daySuffix} ${cursor.value.year}.`;
          taskList.appendChild(listItem);  
          const deleteButton = document.createElement('button');
          listItem.appendChild(deleteButton);
          deleteButton.innerHTML = 'X';
          deleteButton.setAttribute('data-task', cursor.value.taskTitle);
          deleteButton.onclick = event => {
            deleteItem(event);
          }
          cursor.continue();
        } else {
          note.innerHTML += '<li>Entries all displayed.</li>';
      }
    }
  }
  
  taskForm.addEventListener('submit',addData,false);
  
  function addData(e) {
    e.preventDefault();
  
    if(title.value == '' || hours.value == null || minutes.value == null || day.value == '' || month.value == '' || year.value == null) {
      note.innerHTML += '<li>Data not submitted — form incomplete.</li>';
      return;
    } else {
      
      const newItem = [
        { taskTitle: title.value, hours: hours.value, minutes: minutes.value, day: day.value, month: month.value, year: year.value, passed: 'No' }
      ];
        
      console.log(newItem);

      const transaction = db.transaction(["toDoList"], "readwrite");
    
      transaction.oncomplete = event => {
        note.innerHTML += '<li>Transaction opened for task addition.</li>';
      };

      transaction.onerror = event => {
        note.innerHTML += '<li>Transaction not opened due to error. Duplicate items not allowed.</li>';
      };

      const objectStore = transaction.objectStore("toDoList");
      const request = objectStore.add(newItem[0]);        
        request.onsuccess = event => {
          const date = new Date(`${month.value} ${day.value}, ${year.value} ${hours.value}:${minutes.value}:00`);
          alert(date);
          scheduleAlarm(title.value,date);
        
          note.innerHTML += '<li>New item added to database.</li>';
          title.value = '';
          hours.value = '';
          minutes.value = '';
          day.value = '';
          month.value = '';
          year.value = '';
        };
      };
    
      displayData();
    }
  
  function deleteItem(event) {
    const dataTask = event.target.getAttribute('data-task');
    event.target.parentNode.parentNode.removeChild(event.target.parentNode);
    const request = db.transaction(["toDoList"], "readwrite").objectStore("toDoList").delete(dataTask);
    request.onsuccess = event => {
      note.innerHTML += `<li>Task "${dataTask}" deleted.</li>`;
    };
    
  }
  
  
  function checkDeadlines() {
    const now = new Date();
    
    const minuteCheck = now.getMinutes();
    const hourCheck = now.getHours();
    const dayCheck = now.getDate();
    const monthCheck = now.getMonth();
    const yearCheck = now.getFullYear();
    
    console.log(minuteCheck);
    console.log(hourCheck);
    console.log(dayCheck);
    console.log(monthCheck);
    console.log(yearCheck);
    
    const objectStore = db.transaction(['toDoList'], "readwrite").objectStore('toDoList');
    objectStore.openCursor().onsuccess = event => {
      const cursor = event.target.result;
        if(cursor) {
        
        switch(cursor.value.month) {
          case "January":
            var monthNumber = 0;
            break;
          case "February":
            var monthNumber = 1;
            break;
          case "March":
            var monthNumber = 2;
            break;
          case "April":
            var monthNumber = 3;
            break;
          case "May":
            var monthNumber = 4;
            break;
          case "June":
            var monthNumber = 5;
            break;
          case "July":
            var monthNumber = 6;
            break;
          case "August":
            var monthNumber = 7;
            break;
          case "September":
            var monthNumber = 8;
            break;
          case "October":
            var monthNumber = 9;
            break;
          case "November":
            var monthNumber = 10;
            break;
          case "December":
            var monthNumber = 11;
            break;
          default:
          alert('Incorrect month entered in database.');
        }
        
          if(+(cursor.value.hours) == hourCheck && +(cursor.value.minutes) == minuteCheck && +(cursor.value.day) == dayCheck && monthNumber == monthCheck && cursor.value.year == yearCheck && cursor.value.passed == 'No') {
            
            createNotification(cursor.value.taskTitle);
            updatePassed(cursor.value.taskTitle);
          }
          cursor.continue();
        }
        
    }
    
  }
  
  function scheduleAlarm(title,date) {
    const request = navigator.mozAlarms.add(date, "honorTimezone", data);
  }
  
  function createNotification(title) {

    // Let's check if the browser supports notifications
    if (!"Notification" in window) {
      alert("This browser does not support desktop notification");
    }

    // Let's check if the user is okay to get some notification
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      const notification = new Notification(`HEY! Your task "${title}" is now overdue. Deleting.`);
      window.navigator.vibrate(500);
    }

    // Otherwise, we need to ask the user for permission
    // Note, Chrome does not implement the permission static property
    // So we have to check for NOT 'denied' instead of 'default'
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission(permission => {

        // Whatever the user answers, we make sure Chrome stores the information
        if(!('permission' in Notification)) {
          Notification.permission = permission;
        }

        // If the user is okay, let's create a notification
        if (permission === "granted") {
          const notification = new Notification(`HEY! Your task "${title}" is now overdue. Deleting`);
          window.navigator.vibrate(500);
        }
      });
    }

    // At last, if the user already denied any notification, and you 
    // want to be respectful there is no need to bother him any more.
  }
  
  function updatePassed(title) {
    const request = db.transaction(["toDoList"], "readwrite").objectStore("toDoList").delete(title);
    const removeListItem = document.querySelector(`button[data-task="${title}"]`);
    removeListItem.parentNode.parentNode.removeChild(removeListItem.parentNode);
    note.innerHTML += '<li>Deadline passed; item deleted.</li>';
  }
  
  setInterval(checkDeadlines, 1000);
  


}
