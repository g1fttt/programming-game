export default [
  {
    label: "What is the starting size of the field?",
    answers: [
      { label: "3x3", correct: true },
      { label: "4x4" },
      { label: "5x5" },
      { label: "2x2" },
    ],
  },
  {
    label: "Which function allows to get cell under player?",
    answers: [
      { label: "currentCell()", correct: true },
      { label: "getCurrentCell()" },
      { label: "cellUnderPlayer()" },
      { label: "cell()" },
    ],
  },
  {
    label: "What is the maximum achievable size of the field?",
    answers: [
      { label: "10x10", correct: true },
      { label: "8x8" },
      { label: "12x12" },
      { label: "11x11" },
    ],
  },
  {
    label: "What is the most effective way to sow carrot?",
    answers: [
      { label: "Surrounded by potato on each side", correct: true },
      { label: "Surrounded by only carrot" },
      { label: "There's potato!?" },
      { label: "Surrounded by empty cells on each side" },
    ],
  },
  {
    label: "How much time does it take for each growth stage?",
    answers: [
      { label: "Crop-dependant", correct: true },
      { label: "~5 seconds" },
      { label: "~2500 milliseconds" },
      { label: "Don't know, haven't played" },
    ],
  },
  {
    label: "How will the game behave if you will cross the game border?",
    answers: [
      { label: "You will find yourself at the opposite side of the grid", correct: true },
      { label: "Web browser will crash immediately" },
      { label: "Nothing, you will just cross the game border" },
      { label: "The grid will generate new areas at the player position" },
    ],
  },
]
