const heroScreen = document.querySelector("#heroScreen");
const dateContent = document.querySelector("#dateContent");
const yesButton = document.querySelector("#yesButton");
const noButton = document.querySelector("#noButton");
const answerRow = document.querySelector("#answerRow");
const responseBox = document.querySelector("#responseBox");
const dateCards = document.querySelectorAll(".date-card");
const dateModal = document.querySelector("#dateModal");
const modalCard = document.querySelector(".modal-card");
const customDate = document.querySelector("#customDate");
const confirmDate = document.querySelector("#confirmDate");
const closeModal = document.querySelector("#closeModal");
const summaryCard = document.querySelector("#summaryCard");
const summaryPlan = document.querySelector("#summaryPlan");
const summaryDate = document.querySelector("#summaryDate");
const smsButton = document.querySelector("#smsButton");
const startOver = document.querySelector("#startOver");

let noButtonReady = false;
let selectedPlan = "";
let selectedDate = "";
const smsRecipient = "";

const weekendAtMineTitle = "Helgedate hos meg";
const weekendAtMineDates = [
  new Date(2026, 5, 12),
  new Date(2026, 5, 13),
  new Date(2026, 5, 14),
];

function placeNoButtonAtStart() {
  const rowRect = answerRow.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const bounds = getNoButtonBounds(buttonRect);
  const targetLeft = rowRect.left + rowRect.width / 2 + 8;
  const targetTop = rowRect.top + (rowRect.height - buttonRect.height) / 2;

  noButton.style.left = `${clamp(targetLeft, bounds.minLeft, bounds.maxLeft)}px`;
  noButton.style.top = `${clamp(targetTop, bounds.minTop, bounds.maxTop)}px`;
  noButtonReady = true;
}

function moveNoButton() {
  if (!noButtonReady) {
    placeNoButtonAtStart();
  }

  const buttonRect = noButton.getBoundingClientRect();
  const bounds = getNoButtonBounds(buttonRect);
  const yesRect = yesButton.getBoundingClientRect();

  let nextLeft = bounds.minLeft;
  let nextTop = bounds.minTop;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    nextLeft = randomBetween(bounds.minLeft, bounds.maxLeft);
    nextTop = randomBetween(bounds.minTop, bounds.maxTop);

    const overlapsYes =
      nextLeft < yesRect.right + 18 &&
      nextLeft + buttonRect.width > yesRect.left - 18 &&
      nextTop < yesRect.bottom + 18 &&
      nextTop + buttonRect.height > yesRect.top - 18;

    if (!overlapsYes) {
      break;
    }
  }

  setNoButtonPosition(nextLeft, nextTop, buttonRect);
  noButton.classList.remove("is-dodging");
  void noButton.offsetWidth;
  noButton.classList.add("is-dodging");
}

function setNoButtonPosition(
  left,
  top,
  buttonRect = noButton.getBoundingClientRect(),
) {
  const bounds = getNoButtonBounds(buttonRect);

  noButton.style.left = `${clamp(left, bounds.minLeft, bounds.maxLeft)}px`;
  noButton.style.top = `${clamp(top, bounds.minTop, bounds.maxTop)}px`;
}

function keepNoButtonOnScreen() {
  const buttonRect = noButton.getBoundingClientRect();

  setNoButtonPosition(buttonRect.left, buttonRect.top, buttonRect);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNoButtonBounds(buttonRect) {
  const viewportWidth = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth || window.innerWidth,
  );
  const viewportHeight = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight || window.innerHeight,
  );
  const padding = 72;

  return {
    minLeft: padding,
    maxLeft: Math.max(padding, viewportWidth - buttonRect.width - padding),
    minTop: padding,
    maxTop: Math.max(padding, viewportHeight - buttonRect.height - padding),
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function showDateOptions() {
  heroScreen.classList.add("is-hidden");

  window.setTimeout(() => {
    heroScreen.style.display = "none";
    dateContent.classList.add("is-visible");
  }, 420);
}

function showResponse(message) {
  responseBox.textContent = message;
  responseBox.classList.remove("is-updated");
  void responseBox.offsetWidth;
  responseBox.classList.add("is-updated");
}

function openDateModal() {
  dateModal.classList.add("is-visible");
  dateModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeDateModal() {
  dateModal.classList.remove("is-visible");
  dateModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function setupDateInput() {
  const today = new Date();
  customDate.min = formatInputDate(getCustomDateMin(today));

  if (selectedPlan === weekendAtMineTitle) {
    customDate.max = formatInputDate(weekendAtMineDates.at(-1));
  } else {
    customDate.removeAttribute("max");
  }
}

function getCustomDateMin(today) {
  if (selectedPlan === weekendAtMineTitle) {
    return weekendAtMineDates[0];
  }

  return today;
}

function chooseCustomDate() {
  if (!customDate.value) {
    customDate.reportValidity();
    return;
  }

  if (!customDate.validity.valid) {
    customDate.reportValidity();
    return;
  }

  const [year, month, day] = customDate.value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  selectedDate = formatDisplayDate(date);

  updateSummary();
}

function resetDateChoice() {
  selectedDate = "";
  customDate.value = "";
  modalCard.classList.remove("is-summary-step");
  summaryCard.classList.remove("is-visible");
}

function resetToStart() {
  selectedPlan = "";
  resetDateChoice();
  closeDateModal();

  dateCards.forEach((dateCard) => {
    dateCard.classList.remove("is-selected");
  });

  responseBox.textContent = "Velg et kort, så kommer planen til live ✨";
  dateContent.classList.remove("is-visible");
  dateContent.style.display = "none";
  heroScreen.style.display = "";
  heroScreen.classList.remove("is-hidden");
  noButtonReady = false;
  window.setTimeout(placeNoButtonAtStart, 0);
}

function updateSummary() {
  if (!selectedPlan || !selectedDate) {
    return;
  }

  summaryPlan.textContent = selectedPlan;
  summaryDate.textContent = selectedDate;
  smsButton.href = buildSmsLink();
  modalCard.classList.add("is-summary-step");
  summaryCard.classList.add("is-visible");
}

function buildSmsLink() {
  const message = `Hei, jeg har tatt en veldig viktig avgjørelse: ${selectedPlan} den ${selectedDate}. Du kan begynne å glede deg nå 🥰`;

  return `sms:${smsRecipient}?&body=${encodeURIComponent(message)}`;
}

function formatDisplayDate(date) {
  return new Intl.DateTimeFormat("no-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

window.addEventListener("load", placeNoButtonAtStart);
window.addEventListener("resize", keepNoButtonOnScreen);

noButton.addEventListener("mouseenter", moveNoButton);
noButton.addEventListener("animationend", keepNoButtonOnScreen);
noButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  moveNoButton();
});
noButton.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});

yesButton.addEventListener("click", showDateOptions);

closeModal.addEventListener("click", closeDateModal);
dateModal.addEventListener("click", (event) => {
  if (event.target === dateModal) {
    closeDateModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dateModal.classList.contains("is-visible")) {
    closeDateModal();
  }
});

dateCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedPlan = card.dataset.title;
    resetDateChoice();
    setupDateInput();

    dateCards.forEach((dateCard) => {
      dateCard.classList.toggle("is-selected", dateCard === card);
    });

    showResponse(card.dataset.message);
    openDateModal();
    updateSummary();
  });
});

confirmDate.addEventListener("click", chooseCustomDate);
startOver.addEventListener("click", resetToStart);

setupDateInput();
