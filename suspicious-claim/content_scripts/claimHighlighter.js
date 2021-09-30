/**
 * Dieses Skript enthält alle Funktionalität zum Auswählen von Text auf einer Website
 *
 */


// 1. Der User wählt Text aus (markiert diesen)
// optional: Das Skript findet das nächste Block-Level-Elternelement per Heuristik (TODO)
// 3. Es erscheint ein Button "classify"
// 4. Bei Klick auf den Button gibt text-picker.js den Text weiter an ein Background-Script zur Vorverarbeitung
jQuery.noConflict();
(function ($) {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    const URLS = new Map();
    // TODO: get this from configuration
    URLS.set("base", "http://localhost:5000")
    URLS.set("predict_single", new URL("predict", URLS.get("base")))
    URLS.set("predict_text", new URL("predict_text", URLS.get("base")))
    URLS.set("tokenize", new URL("tokenize", URLS.get("base")))

    /**
     * background colors for text highlighting
     */
    const LABELS_TO_CSS = new Map();
    LABELS_TO_CSS.set("SUPPORTS", "supported");        //"lightseagreen",
    LABELS_TO_CSS.set("REFUTES", "refuted");        //"tomato",
    LABELS_TO_CSS.set("NOT ENOUGH INFO", "nei");      //"#C2AE12"

    /**
     * Show classification button on given location
     * @param location
     */
    function showButton(location) {
        let classifyBtn = document.createElement("a");
        // TODO: implement button creation and placement
    }

    /**
     *
     * @param event
     * @param selection
     * @param keywords
     */
    function selectionHandler(selection, keywords) {
        // used for filtering nodes which were already highlighted
        // const timeStamp = new Date().getTime().toString();

        // TODO: reset previous highlighting
        function highlight(child) {
            // alte Hervorhebungen entfernen
            $(".highlight").unmark()

            for (const keyword of keywords) {
                $(child).mark(keyword.sentence, {
                    className: "highlight ".concat(keyword.color),
                    separateWordSearch: false
                });
                // // console.debug(`keyword: '${keyword}'`)
                // let match = child.nodeValue.indexOf(keyword.sentence)
                // if (match !== -1) {
                //     console.debug(`✔️ '${keyword.sentence}' is a match!`)
                //     // create the EM node:
                //     let em = document.createElement('SPAN');
                //     em.setAttribute("class", "highlight " + keyword.color)
                //     em.setAttribute("data-event-timestamp", timeStamp)
                //     // split text into 3 parts: before, mid and after
                //     let mid = child.splitText(match);
                //     mid.splitText(keyword.sentence.length);
                //     // then assign mid part to EM
                //     mid.parentNode.insertBefore(em, mid);
                //     mid.parentNode.removeChild(mid);
                //     em.appendChild(mid);
                // } else {
                //     console.debug(`❌ '${keyword.sentence}' does not match '${child.nodeValue}'`)
                // }
            }
        }

        for (let i = 0; i < selection.rangeCount; i++) {
            let range = selection.getRangeAt(i)
            let startNode = range.commonAncestorContainer.parentElement;
            highlight(startNode)
        }

        /**
         * Einfachste Variante:
         * 1. Über alle Ranges der Selection iterieren
         * 2. Gemeinsames Elternelement aller enthaltenen Nodes holen: .commonAncestorContainer
         * über alle Kindknoten iterieren, die Textknoten sind
         * für jeden Match: domNode.text.indexOf(sentence)
         * entsprechend den vorhergesagten Labels highlighten
         */
        // for (let i = 0; i < selection.rangeCount; i++) {
        //     let range = selection.getRangeAt(i)
        //     let startNode = range.commonAncestorContainer
        //     let treeWalker = document.createTreeWalker(
        //         startNode,
        //         NodeFilter.SHOW_TEXT,
        //         {
        //             acceptNode: (node) => {
        //                 if (range.intersectsNode(node)
        //                     && /\S/.test(node.data)
        //                     // && node.parentElement.getAttribute("data-event-timestamp") !== timeStamp.toString()
        //                 ) {
        //                     return NodeFilter.FILTER_ACCEPT
        //                 }
        //             }
        //         },
        //         false   // TODO: check if this is beneficial to prediction quality
        //     );
        //     // skip parent node if it's not the text node itself which makes up the selection
        //     let currentNode = startNode.nodeType !== startNode.TEXT_NODE ? treeWalker.nextNode() : treeWalker.root;
        //     // let currentNode = treeWalker.currentNode;
        //     // console.debug(currentNode);
        //     while (currentNode !== null) {
        //         // TODO: maybe move to NodeFilter to avoid unnecessary node traversal
        //         if (currentNode.parentElement.getAttribute("data-event-timestamp") !== timeStamp.toString()) {
        //             highlight(currentNode)
        //         }
        //         currentNode = treeWalker.nextNode();
        //     }
        // }
    }

    function getParentElement(selection) {
        // TODO
        return null;
    }


    function replaceWhitespace(s) {
        return s.replace(/\s\s+/, ' ').trim();
    }


    function mockPredictionServerResponse(selection) {
        const splitExpression = /[.!?]/            // use capturing group to include sep

        function getRandomValue(obj) {
            return Object.values(obj)[Math.floor(Math.random() * Object.keys(obj).length)]

        }

        return selection.toString()
            .split(splitExpression)
            .map(s => replaceWhitespace(s))
            .map(s => s.trim())
            .filter(s => s.trim() !== '')
            .map(s => ({sentence: s, color: getRandomValue(LABELS_TO_CSS)}))
    }

    async function postData(url, data) {
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }

    function Prediction(selection) {
        let errHandler = ((error) => {
            console.debug(error)
        });
        const successHandler = selectionHandler

        function transformResult(data) {
            return data.map(s => ({
                sentence: s["claim"],
                color: LABELS_TO_CSS.get(s["predicted_label"])}))
        }

        function getPrediction(text) {
            let response = null;

            postData(URLS.get("predict_text"), {"text": text})
                .then(data => {
                    console.log(data);
                    if (data.result === "success" && data.data.predictions.length !== 0) {
                        let keywords = transformResult(data.data.predictions)
                        successHandler(selection, keywords)
                    }
                })
                .catch(errHandler)
            return response;
        }

        function mockPrediction(text) {
            let response = null;
            let data = {
                "data": {
                    "predictions": [
                        {
                            "claim": "Saudi religious police cracks down on major pork smuggling ring: 319 arrests, 27 tons of bacon seized.",
                            "predicted_evidence": [
                                [
                                    "Islamic_religious_police",
                                    2
                                ],
                                [
                                    "Operation_Blue_Storm",
                                    0
                                ],
                                [
                                    "Norman_Pilcher",
                                    13
                                ],
                                [
                                    "Islamic_religious_police",
                                    0
                                ],
                                [
                                    "USCGC_Courageous_-LRB-WMEC-622-RRB-",
                                    45
                                ]
                            ],
                            "predicted_label": "NOT ENOUGH INFO"
                        },
                        {
                            "claim": "Thousands of police officers were mobilized this morning in Saudi Arabia for a massive operation against a large pork smuggling network, arresting 319 suspects and seizing more than 30 tons of pork meat.",
                            "predicted_evidence": [
                                [
                                    "2007_suicide_bombings_in_Iraq",
                                    259
                                ],
                                [
                                    "2004_world_oil_market_chronology",
                                    47
                                ],
                                [
                                    "Taiwan–Saudi_Arabia_relations",
                                    5
                                ],
                                [
                                    "Taiwan–Saudi_Arabia_relations",
                                    9
                                ],
                                [
                                    "History_of_the_San_Francisco_Police_Department",
                                    280
                                ]
                            ],
                            "predicted_label": "NOT ENOUGH INFO"
                        },
                        {
                            "claim": "More than 4,000 officers of the Saudi police and the Committee for the Promotion of Virtue and the Prevention of Vice acted simultaneously to hit what they describe as “the largest criminal organization in the country.”",
                            "predicted_evidence": [
                                [
                                    "Committee_for_the_Promotion_of_Virtue_and_the_Prevention_of_Vice",
                                    7
                                ],
                                [
                                    "Committee_for_the_Promotion_of_Virtue_and_the_Prevention_of_Vice",
                                    0
                                ],
                                [
                                    "Committee_for_the_Promotion_of_Virtue_and_the_Prevention_of_Vice",
                                    3
                                ],
                                [
                                    "Committee_for_the_Promotion_of_Virtue_and_the_Prevention_of_Vice",
                                    5
                                ],
                                [
                                    "Law_enforcement_in_Venezuela",
                                    4
                                ]
                            ],
                            "predicted_label": "NOT ENOUGH INFO"
                        }
                    ]
                },
                "result": "success"
            }
            window.setTimeout(() => {
                let keywords = transformResult(data.data.predictions)
                response = keywords;
                successHandler(selection, keywords);
            }, 750)
            return response;
        }

        let predictionResults = mockPrediction(selection.toString());

        console.debug(predictionResults)

        return predictionResults;
    }

    window.addEventListener("load", () => {
        // let input = document.getElementById("keywords")
        let btnHighlight = document.getElementById("btn-highlight")

        document.addEventListener("selectionchange", () => {
            // TODO: show button on selection, near selection extents
            console.debug("should enable button")
            btnHighlight.removeAttribute("disabled")
            // let focusNode = window.getSelection().focusNode.
        })

        btnHighlight.addEventListener("click", (e) => {
            let selection = document.getSelection()
            Prediction(selection);
            // selectionHandler(e, selection, keywords)
        });
    });

})(jQuery);
