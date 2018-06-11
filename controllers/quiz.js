const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the quiz with id equals to :quizId
exports.load = (req, res, next, quizId) => {

    models.quiz.findById(quizId)
    .then(quiz => {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// GET /quizzes
exports.index = (req, res, next) => {

    models.quiz.findAll()
    .then(quizzes => {
        res.render('quizzes/index.ejs', {quizzes});
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/show', {quiz});
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const quiz = {
        question: "", 
        answer: ""
    };

    res.render('quizzes/new', {quiz});
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const {question, answer} = req.body;

    const quiz = models.quiz.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz created successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/new', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error creating a new Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/edit', {quiz});
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const {quiz, body} = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz edited successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/edit', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.quiz.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/quizzes');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    });
};
exports.randomplay = (req, res, next) =>{

    console.log("quizzes: " + req.session.quizzes);
    console.log("score: "+ req.session.score);
    const {quiz, query} = req;
    const answer = query.answer || "";
    var lon = 0;
    var ps = [];
    /*
        if(req.session.score >= req.session.quizzes.length){
            delete req.session.quizzes;
            delete req.session.score;
        }
    */
    //creo una variable global score de la sesion:

    //hago lo mismo con un almacen de quizzes
    if(req.session.quizzes === undefined){
        req.session.score =0;
        models.quiz.findAll()
            .then(quizzes => {

            req.session.quizzes = quizzes;

        console.log("quizzes1: " + req.session.quizzes);
        console.log("score1: "+ req.session.score);

        lon = req.session.quizzes;
        var i = Math.floor(Math.random() * lon.length);
        var q = req.session.quizzes[i];
        req.session.quizzes.splice(i, 1);
        res.render('quizzes/random_play', {
            score: req.session.score,
            quiz: q
        });
    })
    .catch(err => console.log(err));

    }else{
        ps = req.session.quizzes;
        if(ps.length === 0){
            var score = req.session.score;

            res.render('quizzes/random_none', {score: score});
        }else{
            lon = req.session.quizzes.length;
            var i = Math.floor(Math.random() * lon);
            var q = req.session.quizzes[i];
            req.session.quizzes.splice(i, 1);
            res.render('quizzes/random_play', {
                score: req.session.score,
                quiz: q
            });
        }
    }


};

exports.randomcheck = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    if(result){
        req.session.score++;
        if(req.session.toBeResolved.length === 0){
            req.session.toBeResolved === undefined;
            res.render('quizzes/random_nomore', {
                score: req.session.score
            })
        }
        else{
            res.render('quizzes/random_result', {
                answer: answer,
                score: req.session.score,
                result: result
            })
        }
    }
    else{
        req.session.toBeResolved === undefined;
        res.render('quizzes/random_result', {
            answer: answer,
            score: req.session.score,
            result: result
        })
    }
};