import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import Issue from './models/Issue';

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/issues');

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});

router.route('/issues').put((req, res) => {
    let issue = new Issue(req.body);
    issue.save()
        .then(issue => {
            res.status(200).json({'issue': 'Added successfully'});
        })
        .catch(err => {
            return500Response(err, res);
        });
});

router.route('/issues').get((req, res) => {
    Issue.find((err, issues) => {
        if (issues.length < 1)
            return404Response(res);
        else if (err)
            return500Response(err, res);
        else
            res.json(issues);
    });
});

router.route('/issues/:id').get((req, res) => {
    Issue.findById(req.params.id, (err, issue) => {
        if (!issue)
            return404Response(res);
        else if (err)
            return500Response(err, res);
        else
            res.json(issue);
    })
});

router.route('/issues/:id').post((req, res) => {
    Issue.findById(req.params.id, (err, issue) => {
        if (!issue)
            return404Response(res);
        else {
            issue.title = req.body.title;
            issue.responsible = req.body.responsible;
            issue.description = req.body.description;
            issue.severity = req.body.severity;
            issue.status = req.body.status;

            issue.save().then(issue => {
                res.json('Update done');
            }).catch(err => {
                return500Response(err, res);
            });
        }
    });
});

router.route('/issues/:id').delete((req, res) => {
    Issue.findByIdAndRemove({_id: req.params.id}, (err, issue) => {
        if (!issue)
            return404Response(res);
        else if (err)
            return500Response(err, res);
        else
            res.json('Removed successfully');
    });
});

app.use('/', router);

app.listen(4000, () => console.log(`Express server running on port 4000`));

function return404Response(res) {
    res.status(404).send('Nothing there dummy!')
}

function return500Response(err, res) {
    console.log('******   Something horribly wrong has occurred!   ******');
    console.log(err);
    res.status(500).json('It\'s all gone to shit!');
}