// load event to ensure DOM is fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {
  // elements
  const grid = document.getElementById("activity-grid");
  const timeLinks = document.querySelectorAll(".time-link");

  // global state
  let currentData = []; // Збережемо тут завантажені дані
  let currentView = "daily";

  // fetch data from data.json
  async function fetchActivities() {
    showLoadingState();

    try {
      // Виконуємо запит до data.json
      const response = await fetch("data.json");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      currentData = await response.json();

      // After fetching data, update the cards
      updateCards(currentView);
    } catch (error) {
      console.error("Could not fetch activity data:", error);
      // if error, show error state
      showErrorState("Could not load data. Please check data.json.");
    }
  }

  // function to update activity cards based on selected timeframe
  function updateCards(timeframe) {
    // clear existing cards
    grid.innerHTML = "";

    let prevText = "Last Week";
    if (timeframe === "daily") {
      prevText = "Yesterday";
    }

    // 3. Проходимося по кожній активності в currentData
    currentData.forEach((activity) => {
      const title = activity.title;
      const timeData = activity.timeframes[timeframe];

      // Якщо раптом даних для 'daily'/'weekly' немає
      if (!timeData) {
        console.warn(`No data for ${title} in ${timeframe} view.`);
        return;
      }

      const currentHours = timeData.current;
      const previousHours = timeData.previous;

      // Створюємо CSS-клас для кольору фону
      const cssClass = title.toLowerCase().replace(" ", "-");

      // Створюємо HTML-код для однієї картки
      const cardHtml = `
                <div class="activity-card bg-card-${cssClass}">
                    <!-- Внутрішній темний блок -->
                    <div class="activity-card-content">
                        
                        <!-- Шапка: Назва і '...' -->
                        <div class="activity-card-header">
                            <h2>${title}</h2>
                            <a href="#" aria-label="More options for ${title}">•••</a>
                        </div>

                        <!-- Тіло: Години і 'previous' -->
                        <div class="activity-card-body">
                            <p class="hours">
                                ${currentHours}hr${currentHours !== 1 ? "s" : ""}
                            </p>
                            <p class="previous">
                                ${prevText} - ${previousHours}hr${previousHours !== 1 ? "s" : ""}
                            </p>
                        </div>

                    </div>
                </div>
            `;

      // Вставляємо створений HTML всередину grid
      grid.insertAdjacentHTML("beforeend", cardHtml);
    });
  }

  // Обробники подій для кнопок
  timeLinks.forEach((link) => {
    // Додаємо слухач 'click' до кожного посилання
    link.addEventListener("click", (e) => {
      e.preventDefault(); // Забороняємо посиланню перезавантажувати сторінку

      // Отримуємо новий 'timeframe'  з data-атрибута
      const newView = link.dataset.timeframe;

      // Якщо вже натиснули на активний, нічого не робимо
      if (newView === currentView) {
        return;
      }

      //  Знімаємо 'active' з усіх посилань
      timeLinks.forEach((l) => l.classList.remove("active"));
      // Додаємо 'active' тільки тому, на який натиснули
      link.classList.add("active");

      // Зберігаємо новий вид і оновлюємо картки
      currentView = newView;
      updateCards(currentView);
    });
  });

  //  Допоміжні функції для стану UI
  // (Показує "Loading..." під час завантаження fetch)
  function showLoadingState() {
    grid.innerHTML = '<p class="loading-text">Loading activity data...</p>';
  }

  // (Показує помилку, якщо fetch не вдався)
  function showErrorState(message) {
    grid.innerHTML = `<p class="error-text">${message}</p>`;
  }

  // Починаємо завантаження даних, як тільки скрипт запустився
  fetchActivities();
});
