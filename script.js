document.addEventListener('DOMContentLoaded', () => {
  
    // Funcionalidad de cambio de tema
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');
    
    // Verificar si hay una preferencia de tema guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        if (savedTheme === 'light') {
            body.classList.remove('dark-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            body.classList.add('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
    
    // Manejar cambio de tema
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });
  
    const mobileAddBtn = document.getElementById('mobileAddBtn');
    const mobileInputPanel = document.createElement('div');
    mobileInputPanel.className = 'mobile-input-panel';
    mobileInputPanel.innerHTML = `
      <div class="input-group">
        <input type="text" id="mobileActivityInput" placeholder="Nueva actividad">
        <input type="date" id="mobileActivityDate">
        <div class="panel-actions">
          <button class="cancel-btn" type="button">Cancelar</button>
          <button class="save-btn" type="button">Agregar</button>
        </div>
      </div>
    `;
    document.body.appendChild(mobileInputPanel);
  
    // Event listeners para el nuevo panel
    mobileAddBtn.addEventListener('click', () => {
      mobileInputPanel.classList.add('visible');
    });
  
    mobileInputPanel.querySelector('.cancel-btn').addEventListener('click', () => {
      mobileInputPanel.classList.remove('visible');
    });
  
    mobileInputPanel.querySelector('.save-btn').addEventListener('click', () => {
      const text = document.getElementById('mobileActivityInput').value.trim();
      const date = document.getElementById('mobileActivityDate').value;
  
      if (text) {
        createActivityElement(text, date, 'pendiente');
        saveActivity(text, date, 'pendiente');
        mobileInputPanel.classList.remove('visible');
        document.getElementById('mobileActivityInput').value = '';
        document.getElementById('mobileActivityDate').value = '';
      }
    });
    
      const activityInput = document.getElementById('activityInput');
      const addButton = document.getElementById('addButton');
      const activitiesList = document.getElementById('activitiesList');
      const archivedList = document.getElementById('archivedList');
      const pendingCountElement = document.getElementById('pendingCount');
      const completedCountElement = document.getElementById('completedCount');
      const sortByDateHeader = document.getElementById('sortByDate');
      const sortByStatusHeader = document.getElementById('sortByStatus');
      const toggleArchivedBtn = document.getElementById('toggleArchived');
  
      let activities = getActivities();
      let archivedActivities = getArchivedActivities();
      let currentSortField = null;
      let isAscending = true;
  
      loadActivities();
      loadArchivedActivities();
      updateActivityCounters();
  
      addButton.addEventListener('click', addActivity);
      sortByDateHeader.addEventListener('click', () => sortActivities('date'));
      sortByStatusHeader.addEventListener('click', () => sortActivities('status'));
      
      toggleArchivedBtn.addEventListener('click', function() {
          this.classList.toggle('active');
          archivedList.classList.toggle('hidden');
          archivedList.classList.toggle('visible');
      });
  
      function sortActivities(field) {
          // Reset the other header
          if (field === 'date') {
              sortByStatusHeader.classList.remove('active', 'desc');
          } else {
              sortByDateHeader.classList.remove('active', 'desc');
          }
  
          const header = field === 'date' ? sortByDateHeader : sortByStatusHeader;
          
          // If clicking the same header, toggle order
          if (currentSortField === field) {
              isAscending = !isAscending;
              header.classList.toggle('desc', !isAscending);
          } else {
              // First time clicking this header
              currentSortField = field;
              isAscending = true;
              header.classList.add('active');
              header.classList.remove('desc');
          }
  
          // Sort activities
          activities = getActivities();
          
          if (field === 'date') {
              activities.sort((a, b) => {
                  const dateA = a.date ? new Date(a.date) : new Date(0);
                  const dateB = b.date ? new Date(b.date) : new Date(0);
                  return isAscending ? dateA - dateB : dateB - dateA;
              });
          } else if (field === 'status') {
              activities.sort((a, b) => {
                  const statusA = a.status || 'pendiente';
                  const statusB = b.status || 'pendiente';
                  // Sort 'pendiente' before 'finalizado' in ascending order
                  const comparison = statusA === statusB ? 0 : statusA === 'pendiente' ? -1 : 1;
                  return isAscending ? comparison : -comparison;
              });
          }
  
          // Save sorted activities and reload
          localStorage.setItem('activities', JSON.stringify(activities));
          activitiesList.innerHTML = '';
          loadActivities();
      }
  
      function addActivity() {
          const activityText = activityInput.value.trim();
          const activityDate = document.getElementById('activityDate').value;
          const activityStatus = 'pendiente'; 
          if (activityText !== "") {
              createActivityElement(activityText, activityDate, activityStatus);
              saveActivity(activityText, activityDate, activityStatus);
              activityInput.value = "";
              document.getElementById('activityDate').value = "";
          }
      }
  
      function createActivityElement(activityText, activityDate, activityStatus) {
          const li = document.createElement('li');
          
          if (activityStatus === 'finalizado') {
              li.style.borderLeftColor = '#43e97b';
          } else {
              // Add color coding based on date proximity
              if (activityDate) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const targetDate = new Date(activityDate + 'T00:00:00');
                  const timeLeft = targetDate.getTime() - today.getTime();
                  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                  
                  if (daysLeft < 0) {
                      li.style.borderLeftColor = '#e74c3c'; // Overdue
                  } else if (daysLeft <= 2) {
                      li.style.borderLeftColor = '#f39c12'; // Due soon
                  } 
              }
          }
          
          const statusCheckbox = document.createElement('input');
          statusCheckbox.type = 'checkbox';
          statusCheckbox.classList.add('status-checkbox');
          statusCheckbox.checked = activityStatus === 'finalizado';
          statusCheckbox.addEventListener('change', function() {
              updateActivityStatus(li, activityText, activityDate, this.checked ? 'finalizado' : 'pendiente');
          });
          li.appendChild(statusCheckbox);
  
          const activitySpan = document.createElement('span');
          activitySpan.textContent = activityText;
          if (activityStatus === 'finalizado') {
              activitySpan.classList.add('completed');
          }
          li.appendChild(activitySpan);
  
          let dateSpan;
          if (activityDate) {
              dateSpan = document.createElement('span');
              const formattedDate = new Date(activityDate + 'T00:00:00').toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
              });
              dateSpan.textContent = ` - Fecha límite: ${formattedDate}`;
              dateSpan.classList.add('activity-date');
              li.appendChild(dateSpan);
  
              const countdownSpan = document.createElement('span');
              countdownSpan.classList.add('countdown');
              li.appendChild(countdownSpan);
              updateCountdown(activityDate, countdownSpan);
          }
  
          const editButton = document.createElement('button');
          editButton.innerHTML = '<i class="fas fa-edit"></i>';
          editButton.title = 'Modificar';
          editButton.onclick = function() {
              editActivity(li, activityText, activityDate, activityStatus);
          };
          li.appendChild(editButton);
  
          const deleteButton = document.createElement('button');
          deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
          deleteButton.title = 'Eliminar';
          deleteButton.onclick = function() {
              li.remove();
              deleteActivity(activityText, activityDate);
          };
          li.appendChild(deleteButton);
          activitiesList.appendChild(li);
          return li;
      }
  
      function updateCountdown(activityDate, countdownSpan) {
          if (!activityDate) return;
  
          const targetDate = new Date(activityDate + 'T00:00:00');
          const now = new Date();
          now.setHours(0, 0, 0, 0);  
  
          const timeLeft = targetDate.getTime() - now.getTime();
          const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  
          if (daysLeft < 0) {
              countdownSpan.textContent = " - Vencido";
              countdownSpan.style.color = '#e74c3c';
          } else if (daysLeft === 0) {
              countdownSpan.textContent = " - Hoy";
              countdownSpan.style.color = '#e61919';
          } else if (daysLeft <= 2) {
              countdownSpan.textContent = ` - Faltan: ${daysLeft} días`;
              countdownSpan.style.color = '#f39c12';
          } else {
              countdownSpan.textContent = ` - Faltan: ${daysLeft} días`;
          }
      }
  
      function editActivity(listItem, originalText, originalDate, originalStatus) {
          // Create modal panel
          const modalOverlay = document.createElement('div');
          modalOverlay.classList.add('modal-overlay');
          
          const modalPanel = document.createElement('div');
          modalPanel.classList.add('modal-panel');
          
          const modalTitle = document.createElement('h2');
          modalTitle.textContent = 'Modificar Actividad';
          modalPanel.appendChild(modalTitle);
          
          // Create form elements
          const formContainer = document.createElement('div');
          formContainer.classList.add('edit-form');
          
          const textLabel = document.createElement('label');
          textLabel.textContent = 'Actividad:';
          const inputActivity = document.createElement('input');
          inputActivity.type = 'text';
          inputActivity.value = originalText;
          formContainer.appendChild(textLabel);
          formContainer.appendChild(inputActivity);
          
          const dateLabel = document.createElement('label');
          dateLabel.textContent = 'Fecha límite:';
          const inputDate = document.createElement('input');
          inputDate.type = 'date';
          inputDate.value = originalDate || '';
          formContainer.appendChild(dateLabel);
          formContainer.appendChild(inputDate);
          
          const statusLabel = document.createElement('label');
          statusLabel.textContent = 'Estado:';
          const statusSelect = document.createElement('select');
          const pendienteOption = document.createElement('option');
          pendienteOption.value = 'pendiente';
          pendienteOption.textContent = 'Pendiente';
          const finalizadoOption = document.createElement('option');
          finalizadoOption.value = 'finalizado';
          finalizadoOption.textContent = 'Finalizado';
          statusSelect.appendChild(pendienteOption);
          statusSelect.appendChild(finalizadoOption);
          statusSelect.value = originalStatus;
          formContainer.appendChild(statusLabel);
          formContainer.appendChild(statusSelect);
          
          modalPanel.appendChild(formContainer);
          
          // Add buttons
          const buttonContainer = document.createElement('div');
          buttonContainer.classList.add('modal-buttons');
          
          const saveButton = document.createElement('button');
          saveButton.classList.add('save-button');
          saveButton.innerHTML = '<i class="fas fa-save"></i> Guardar';
          
          const cancelButton = document.createElement('button');
          cancelButton.classList.add('cancel-button');
          cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancelar';
          
          buttonContainer.appendChild(saveButton);
          buttonContainer.appendChild(cancelButton);
          modalPanel.appendChild(buttonContainer);
          
          // Add modal to DOM
          modalOverlay.appendChild(modalPanel);
          document.body.appendChild(modalOverlay);
          
          // Add event listeners
          saveButton.onclick = function() {
              const newActivityText = inputActivity.value.trim();
              const newActivityDate = inputDate.value;
              const newActivityStatus = statusSelect.value;
              if (newActivityText !== "") {
                  updateActivity(listItem, originalText, originalDate, originalStatus, newActivityText, newActivityDate, newActivityStatus);
                  document.body.removeChild(modalOverlay);
              }
          };
          
          cancelButton.onclick = function() {
              document.body.removeChild(modalOverlay);
          };
      }
  
      function updateActivity(listItem, originalText, originalDate, originalStatus, newActivityText, newActivityDate, newActivityStatus) {
          const statusCheckbox = listItem.querySelector('.status-checkbox');
          statusCheckbox.checked = newActivityStatus === 'finalizado';
  
          const activitySpan = listItem.querySelector('span');
          activitySpan.textContent = newActivityText;
          if (newActivityStatus === 'finalizado') {
              activitySpan.classList.add('completed');
          } else {
              activitySpan.classList.remove('completed');
          }
  
          let dateSpan = listItem.querySelector('.activity-date');
          let countdownSpan = listItem.querySelector('.countdown');
          if (newActivityDate) {
              if (!dateSpan) {
                  dateSpan = document.createElement('span');
                  dateSpan.classList.add('activity-date');
                  listItem.appendChild(dateSpan);
              }
              if (!countdownSpan) {
                  countdownSpan = document.createElement('span');
                  countdownSpan.classList.add('countdown');
                  listItem.appendChild(countdownSpan);
              }
              const formattedDate = new Date(newActivityDate + 'T00:00:00').toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
              });
              dateSpan.textContent = ` - Fecha límite: ${formattedDate}`;
              updateCountdown(newActivityDate, countdownSpan);
          } else {
              if (dateSpan) {
                  dateSpan.remove();
              }
              if (countdownSpan) {
                  countdownSpan.remove();
              }
          }
  
          let activities = getActivities();
          const activityIndex = activities.findIndex(activity => activity.text === originalText && activity.date === originalDate && activity.status === originalStatus);
          if (activityIndex !== -1) {
              activities[activityIndex] = { text: newActivityText, date: newActivityDate, status: newActivityStatus };
              localStorage.setItem('activities', JSON.stringify(activities));
              updateActivityCounters();
          }
      }
  
      function updateActivityStatus(listItem, activityText, activityDate, newActivityStatus) {
          const activitySpan = listItem.querySelector('span');
          if (newActivityStatus === 'finalizado') {
              activitySpan.classList.add('completed');
              listItem.style.borderLeftColor = '#43e97b';
              // Move to archived list
              const activityData = {
                  text: activityText,
                  date: activityDate,
                  status: newActivityStatus
              };
              moveToArchive(listItem, activityData);
          } else {
              activitySpan.classList.remove('completed');
              listItem.style.borderLeftColor = '#4a69bd';
          }
  
          const statusCheckbox = listItem.querySelector('.status-checkbox');
          statusCheckbox.checked = newActivityStatus === 'finalizado';
  
          let activities = getActivities();
          const activityIndex = activities.findIndex(activity => activity.text === activityText && activity.date === activityDate);
          if (activityIndex !== -1) {
              activities[activityIndex].status = newActivityStatus;
              localStorage.setItem('activities', JSON.stringify(activities));
              updateActivityCounters();
          }
      }
  
      function saveActivity(activityText, activityDate, activityStatus) {
          let activities = getActivities();
          activities.push({ text: activityText, date: activityDate, status: activityStatus });
          localStorage.setItem('activities', JSON.stringify(activities));
          updateActivityCounters();
          
          // Reset sorting state when adding new activity
          currentSortField = null;
          isAscending = true;
          sortByDateHeader.classList.remove('active', 'desc');
          sortByStatusHeader.classList.remove('active', 'desc');
      }
  
      function deleteActivity(activityText, activityDate) {
          let activities = getActivities();
          activities = activities.filter(activity => !(activity.text === activityText && activity.date === activityDate));
          localStorage.setItem('activities', JSON.stringify(activities));
          updateActivityCounters();
      }
  
      function loadActivities() {
          const activities = getActivities();
          activities.forEach(activity => {
              createActivityElement(activity.text, activity.date, activity.status || 'pendiente');
          });
      }
  
      function getActivities() {
          const storedActivities = localStorage.getItem('activities');
          return storedActivities ? JSON.parse(storedActivities) : [];
      }
  
      function updateActivityCounters() {
          const activities = getActivities();
          const archivedActivities = getArchivedActivities();
          
          const pendingCount = activities.filter(activity => activity.status === 'pendiente').length;
          const completedCount = activities.filter(activity => activity.status === 'finalizado').length + 
                                 archivedActivities.length;
          
          pendingCountElement.textContent = pendingCount;
          completedCountElement.textContent = completedCount;
          
          // Add animation effect
          animateCounter(pendingCountElement);
          animateCounter(completedCountElement);
      }
      
      function animateCounter(element) {
          element.classList.add('animate-pulse');
          setTimeout(() => {
              element.classList.remove('animate-pulse');
          }, 800);
      }
  
      function moveToArchive(listItem, activityData) {
          // Add to archived activities
          let archivedActivities = getArchivedActivities();
          archivedActivities.push(activityData);
          localStorage.setItem('archivedActivities', JSON.stringify(archivedActivities));
          
          // Remove from active list with animation
          listItem.style.opacity = '0';
          listItem.style.transform = 'translateX(50px)';
          
          setTimeout(() => {
              listItem.remove();
              
              // Create in archived list
              createArchivedElement(activityData.text, activityData.date);
              
              // Remove from active activities
              let activities = getActivities();
              activities = activities.filter(activity => 
                  !(activity.text === activityData.text && activity.date === activityData.date));
              localStorage.setItem('activities', JSON.stringify(activities));
          }, 300);
      }
  
      function createArchivedElement(activityText, activityDate) {
          const li = document.createElement('li');
          li.style.borderLeftColor = '#43e97b';
          
          const activitySpan = document.createElement('span');
          activitySpan.textContent = activityText;
          activitySpan.classList.add('completed');
          li.appendChild(activitySpan);
  
          if (activityDate) {
              const dateSpan = document.createElement('span');
              const formattedDate = new Date(activityDate + 'T00:00:00').toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
              });
              dateSpan.textContent = ` - Fecha: ${formattedDate}`;
              dateSpan.classList.add('activity-date');
              li.appendChild(dateSpan);
          }
  
          const buttonsContainer = document.createElement('div');
          buttonsContainer.classList.add('archived-buttons');
  
          const restoreButton = document.createElement('button');
          restoreButton.innerHTML = '<i class="fas fa-undo"></i>';
          restoreButton.title = 'Restaurar';
          restoreButton.onclick = function() {
              restoreArchivedActivity(li, activityText, activityDate);
          };
          buttonsContainer.appendChild(restoreButton);
  
          const deleteButton = document.createElement('button');
          deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
          deleteButton.title = 'Eliminar';
          deleteButton.onclick = function() {
              li.remove();
              deleteArchivedActivity(activityText, activityDate);
          };
          buttonsContainer.appendChild(deleteButton);
          
          li.appendChild(buttonsContainer);
          
          // Add with animation
          li.style.opacity = '0';
          li.style.transform = 'translateX(-50px)';
          archivedList.appendChild(li);
          
          setTimeout(() => {
              li.style.transition = 'all 0.3s ease';
              li.style.opacity = '1';
              li.style.transform = 'translateX(0)';
          }, 10);
          
          return li;
      }
  
      function restoreArchivedActivity(listItem, activityText, activityDate) {
          // Remove from archived with animation
          listItem.style.opacity = '0';
          listItem.style.transform = 'translateX(50px)';
          
          setTimeout(() => {
              listItem.remove();
              
              // Add to active list
              const activityData = {
                  text: activityText,
                  date: activityDate,
                  status: 'pendiente'  // Set as pending when restored
              };
              
              // Add to active activities
              let activities = getActivities();
              activities.push(activityData);
              localStorage.setItem('activities', JSON.stringify(activities));
              
              // Create in active list
              createActivityElement(activityData.text, activityData.date, activityData.status);
              
              // Remove from archived activities
              let archivedActivities = getArchivedActivities();
              archivedActivities = archivedActivities.filter(activity => 
                  !(activity.text === activityText && activity.date === activityDate));
              localStorage.setItem('archivedActivities', JSON.stringify(archivedActivities));
              
              updateActivityCounters();
          }, 300);
      }
  
      function loadArchivedActivities() {
          const archivedActivities = getArchivedActivities();
          archivedActivities.forEach(activity => {
              createArchivedElement(activity.text, activity.date);
          });
      }
  
      function getArchivedActivities() {
          const storedActivities = localStorage.getItem('archivedActivities');
          return storedActivities ? JSON.parse(storedActivities) : [];
      }
  
      function deleteArchivedActivity(activityText, activityDate) {
          let archivedActivities = getArchivedActivities();
          archivedActivities = archivedActivities.filter(activity => 
              !(activity.text === activityText && activity.date === activityDate));
          localStorage.setItem('archivedActivities', JSON.stringify(archivedActivities));
          updateActivityCounters();
      }
  
      // Initial animation for cards
      document.querySelectorAll('.summary-card').forEach(card => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
              card.style.transition = 'all 0.5s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
          }, 100);
      });
  });