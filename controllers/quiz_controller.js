var models = require('../models/models.js');

// Autoload - factoriza el códigosi ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId=' + quizId)); }
		}
	).catch(function(error) { next(error);});
};

//GET /quizes
exports.index = function(req, res) {
	if (req.query.search) {
		var search = req.query.search;
		
		while(search.indexOf(" ") > 0) {
			search = search.replace(" ","%");
		}
		search = "%" + search + "%";

		models.Quiz.findAll({where: ["pregunta like ?",  search], 
					order: 'pregunta ASC'}).then(
			function(quizes) {
				res.render('quizes/index.ejs', { quizes: quizes});
			}
		).catch(function(error) { next(error);})
	} else {
		models.Quiz.findAll().then(function(quizes) {
				res.render('quizes/index.ejs', { quizes: quizes});
			}
		).catch(function(error) { next(error);})	
	}	
};

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorreto';
	if (req.query.respuesta === req.quiz.respuesta) {
			resultado = 'Correcto';
	} 
	res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado});
};
