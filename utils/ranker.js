const {HIGHEST_RANK, LOWEST_RANK, EXCLUDED_WORDS} = require('../constants');

/**
 *
 * @param arr:  a sorted array according to the frequency
 * @param lowest: lowest rank possible
 * @param highest: highest rank possible
 * @param frequencyMap: a Hash Map containing the unique words with their occurrences in a text
 * @returns {{}} : a Hash Map of the arr words ranked from lowest to highest according to their frequency
 */
let rankArrayfromXtoY = (arr, lowest, highest, frequencyMap) => {

    let result = new Map();
    if (!arr || !arr.length) {
        return {};
    }

    //set the highest frequency and add it to the result as highest rank
    let highestFrequency = frequencyMap.get(arr[0]);
    result.set(arr[0], highest);

    let highestRankGiven = highest;

    for (let i = 1; i < arr.length; i++) {
        if (frequencyMap.get(arr[i]) === highestFrequency) {
            result.set(arr[i], highest)
        } else if (frequencyMap.get(arr[i]) < highestFrequency) {
            // assuming the array is sorted by frequency in the previous step,
            // the else statement should always ensure that we are dealing with less frequent word.

            // if only one word is remained to check then we would rank it as lowest for example.
            // therefore we need to rank according to how many words left to check
            if (arr.length - i > highestRankGiven - 1) {
                result.set(arr[i], highestRankGiven - 1)
                highestRankGiven--;
            } else {
                // if the remaining words to check are less than the highest possible ranking then rank it accordingly
                result.set(arr[i], arr.length - i);
                highestRankGiven = arr.length - i;
            }

        } else {
            // if we get here then something went wrong in the previous step,
            // as we should not deal with more frequent word assuming the array is sorted by frequency
            // therefore, we will return an empty result
            result = {};
            break;
        }


    }

    // return as an array containing word and rank based on the resulted hash map
    return Array.from(result, ([word, rank]) => ({word, rank}));
}

/**
 *
 * @param str: string to rank top K frequent words in it
 * @param k: top K frequent words number
 * @returns {[]} : an Array of words ranked from lowest to highest according to their frequency
 */
let topKOccurrences = (str, k) => {

    let extractedString = str;

    if (!str || !str.length) {
        return [];
    }
    // ********** Prepare array of words **********

    // first remove all \n from the string
    extractedString = extractedString.replace(/\n/g, ' ');

    // second remove all non-alphabetically characters such as ( : , etc)
    extractedString = extractedString.replace(/\W/g, ' ');

    // keep only one space between words before the split operation
    extractedString = extractedString.replace(/\s\s+/g, ' ');

    // split string to an array of words
    extractedString = extractedString.split(" ");


    // ********** Array of words is ready for frequency calculation **********

    // prepare hashmap for storing frequency of words
    const frequencyMap = new Map();
    // prepare an array to hold ONLY unique words
    const uniqueWords = [];

    for (let word of extractedString) {
        word = word.toLowerCase();

        // exclude some pre-defined words such as verbs (in, on , an, with, of .. etc)
        if (word.length <= 1 || EXCLUDED_WORDS.indexOf(word) > -1) {
            continue;
        }
        frequencyMap.has(word) ?
            frequencyMap.set(word, frequencyMap.get(word) + 1)
            :
            frequencyMap.set(word, 1) && uniqueWords.push(word)
    }

    // using an array we will return only top k words with most frequency
    // sort by frequency, else by ascending alphabetically order
    uniqueWords.sort((word1, word2) => {
        const frequency1 = frequencyMap.get(word1);
        const frequency2 = frequencyMap.get(word2);
        if (frequency1 < frequency2) {
            return 1;
        } else if (frequency1 > frequency2) {
            return -1;
        } else {
            // if both has the same frequency sort alphabetically
            if (word1 === word2) {
                // this could should not be reachable assuming we are sorting only unique words, but lets keep it
                return 0;
            } else if (word1 < word2) {
                return -1;
            } else {
                return 1;
            }
        }
    })

    const topKwords = uniqueWords.slice(0, k);

    const rankedMap = rankArrayfromXtoY(topKwords, LOWEST_RANK, HIGHEST_RANK, frequencyMap);

    // return top k words as a list
    return rankedMap || [];

}

module.exports.topKOccurrences = topKOccurrences;
