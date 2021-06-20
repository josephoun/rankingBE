const express = require('express');
const router = express.Router();
const axios = require('axios');
const ranker = require('../utils/ranker');

const { TOP_K } = require('../constants');

router.get('/rankWikiTopic',(req, res) => {
    let query = req.query.query;
    const url = `https://en.wikipedia.org/w/api.php`;

    axios.get(url, {
        params: {
            action: "opensearch",
            search: query
        }
    }).then((response) => {

        // check if query has topics
        if (response.data && response.data[1] && response.data[1].length > 0) {

            const topic = response.data[1][0];

            axios.get(`https://en.wikipedia.org/w/api.php`, {
                params: {
                    action: "query",
                    prop: "extracts",
                    format: "json",
                    titles: topic,
                    explaintext: ''
                }
            }).then(
                (extractResponse) => {

                    // validate response
                    if (!extractResponse.data || !extractResponse.data.query) {
                        res.status(404).send({success: false, data: []});
                    }

                    const extractDataQuery = extractResponse.data.query;

                    // keep validating response
                    if (!extractDataQuery.pages) {
                        res.status(404).send({success: false, data: []});
                    }

                    // finally use ranker module to get top k ranked words
                    const firstPage = Object.keys(extractDataQuery.pages)[0];
                    const rankedKWords = ranker.topKOccurrences(extractDataQuery.pages[firstPage].extract, TOP_K);

                    res.status(200).json({success: true, data: rankedKWords})
                }
            ).catch(err => {
                // something went wrong while requesting from wikipedia
                res.status(500).send({error: err})
            })
        } else {
            // no topics found on this query in wikipedia but no error found.
            res.status(404).send({success: false, data: []});
        }
    }).catch(function (err) {
        // something went wrong while requesting from wikipedia
        res.status(500).send({error: err})
    });

});


module.exports = router;
