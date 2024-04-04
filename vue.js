let chatbotApp = new Vue({
  el: "#chatbotApp",
  data: {
    questions: [],
    temp: [],
    sessionQuestions: [],
    sessionAnswers: [],
    selectedQuestion: null,
    selectedPath: null,
    selectedQuestions: [], // Initialize an array to store selected questions
    isChatbotOpen: false,
  },
  mounted() {
    const storedSessionQuestions =
      JSON.parse(localStorage.getItem("sessionQuestions")) || [];
    const storedSessionAnswers =
      JSON.parse(localStorage.getItem("sessionAnswers")) || [];

    this.sessionQuestions = storedSessionQuestions;
    this.sessionAnswers = storedSessionAnswers;

    if (storedSessionQuestions.length > 0) {
      this.currentQuestion =
        storedSessionQuestions[storedSessionQuestions.length - 1];
    }

    if (storedSessionAnswers.length > 0) {
      this.currentAnswer =
        storedSessionAnswers[storedSessionAnswers.length - 1];
    }
    this.loadQuestions();
  },
  methods: {
    // Function to get the path of a target object in a nested object
    getPath(obj, target, path = "") {
      let finalPath = "null";
      for (const key in obj) {
        const newPath = (path ? path + "." : "") + key;
        if (obj[key] === target) {
          finalPath = newPath;
          break;
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          const result = this.getPath(obj[key], target, newPath);
          if (result !== "null") {
            finalPath = result;
            break;
          }
        }
      }
      return (this.selectedPath = finalPath);
    },
    findQuestionByPath(path) {
      this.selectedQuestion = _.get(this.questions, path);
      return this.selectedQuestion;
    },
    async loadQuestions() {
      const file = "questions.yaml";
      fetch(file)
        .then((response) => response.text())
        .then((yamlData) => {
          this.questions = jsyaml.load(yamlData).questions;
        })
        .catch((error) => {
          console.error("Error loading questions:", error);
        });
    },
    storeQuestions(question, index) {
      // Retrieving sessionQuestions from localStorage
      const storedSessionQuestions =
        JSON.parse(localStorage.getItem("sessionQuestions")) || [];

      if (!question.questions) {
        // Adding the new question to the sessionQuestions array
        this.sessionQuestions = [...storedSessionQuestions, question.question];

        this.loadAnswerForQuestion(question);
      } else {
        this.selectedQuestion = question.questions[index];
        this.$nextTick(() => {
          this.scrollToElement(this.$refs.bottom);
        });
        // Adding the new question to the sessionQuestions array
        this.sessionQuestions = [
          ...storedSessionQuestions,
          question.questions[index].question,
        ];
        this.loadAnswerForQuestion(question.questions[index]);
      }
      // Saving updated sessionQuestions to localStorage
      localStorage.setItem(
        "sessionQuestions",
        JSON.stringify(this.sessionQuestions)
      );
    },
    resetSessionQuestions() {
      this.sessionQuestions = [];
      this.sessionAnswers = [];
      this.selectedQuestion = null;
      localStorage.removeItem("sessionQuestions");
      localStorage.removeItem("sessionAnswers");
    },
    loadAnswerForQuestion(question) {
      const parsedQuestions = this.questions;

      // Find the question in the YAML file
      const foundQuestion = parsedQuestions.find(
        (q) => q.question === question.question
      );
      console.log("foundQuestion:", foundQuestion);
      // If the question is found, get its answer
      if (foundQuestion) {
        this.currentAnswer = foundQuestion.route;
      }
      this.sessionAnswers = [...this.sessionAnswers, this.currentAnswer];
      localStorage.setItem(
        "sessionAnswers",
        JSON.stringify(this.sessionAnswers)
      );
    },
    // Function to add a selected question to the tree structure
    addSelectedQuestion(questionText, route) {
      // Create a new object representing the selected question and its route
      const selectedQuestion = {
        text: questionText,
        route: route,
      };

      // Add the selected question to the array
      this.selectedQuestions.push(selectedQuestion);
    },
    roleUp() {
      // this.addSelectedQuestion(questionText, route);
    },
    scrollToElement(element) {
      element.scrollIntoView({ behavior: "smooth", block: "end" });
    },
    toggleChatbot() {
      this.isChatbotOpen = !this.isChatbotOpen;
    },
    selectQuestion(question, index = 0) {
      this.storeQuestions(question, index);
      this.selectedQuestion = question;
      this.$nextTick(() => {
        this.scrollToElement(this.$refs.bottom);
      });
    },
    selectOption(option) {
      console.log(option);
      if (option.link) {
        this.selectedQuestion = option;
      }
    },
    handleOptionClick(option, index) {
      if (option.link && !option.questions) {
        window.open(option.link, "_blank");
      } else if (option.questions) {
        this.selectQuestion(option.questions, index);
      }
    },
  },
});
