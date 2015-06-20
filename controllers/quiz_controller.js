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
				res.render('quizes/index.ejs', { quizes: quizes, errors: []});
			}
		).catch(function(error) { next(error);})
	} else {
		models.Quiz.findAll().then(function(quizes) {
				res.render('quizes/index.ejs', { quizes: quizes, errors: []});
			}
		).catch(function(error) { next(error);})	
	}	
};

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorreto';
	if (req.query.respuesta === req.quiz.respuesta) {
			resultado = 'Correcto';
	} 
	res.render(
		'quizes/answer', 
		{ quiz: req.quiz, 
		  respuesta: resultado,
		  errors: []
		}
	);
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(  // crea objecto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta",}
	);

	res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz );

	quiz
	.validate()
	.then(
		function(err){
			if (err) {
				res.render('/quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				// guarda en DB los campos pregunta y respuesta de quiz
				quiz
				.save({fields: ["pregunta", "respuesta"]})
				.then(function(){ res.redirect('/quizes');})
			}  // Redirección HTTP (URL relativo) lista de preguntas
		}
	);
};

// GET /quizes/:quizId/edit
exports.edit = function(req, res) {
	var quiz = req.quiz  // autoload de instancia de quiz

	res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:quizId
exports.update = function(req, res) {
 	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz
	.validate()
	.then(
		function(err){
			if (err) {
				res.render('/quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz   // save: guarda campos pregunta y respuesta en DB
				.save( {fields: ["pregunta", "respuesta"]})
				.then( function(){ res.redirect('/quizes');})
			}  // Redirección HTTP a lista de preguntas (URL relativo)
		}
	);
};

// DELETE /quizes/:quizId
exports.destroy = function(req, res) {
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch(function(error) {next(error)});
};