import React from 'react';
import HeatMap from '../HeatMap'
import Collapsible from 'react-collapsible'
import { API_ROOT } from '../../api-config';
import { withRouter } from 'react-router-dom';
import Model from '../Model'
import OutputField from '../OutputField'
import SyntaxHighlight from '../highlight/SyntaxHighlight.js';

const title = "Text to SQL";

const description = (
  <span>
    <span>
    Natural language to SQL interfaces allow users to query data in relational databases without writing
    SQL queries. This demo is an implementation of an encoder-decoder architecture with LSTMs and <a href="https://www.semanticscholar.org/paper/Neural-Semantic-Parsing-with-Type-Constraints-for-Krishnamurthy-Dasigi/8c6f58ed0ebf379858c0bbe02c53ee51b3eb398a"> constrained type decoding </a>
    trained on the <a href="https://www.semanticscholar.org/paper/The-ATIS-Spoken-Language-Systems-Pilot-Corpus-Hemphill-Godfrey/1d19708290ef3cc3f43c2c95b07acdd4f52f5cda"> ATIS </a>
    dataset.  This model is still a proof-of-concept of what you can do with semantic parsing in AllenNLP
    and its performance is not state-of-the-art (this naive model gets around 40% exact denotation accuracy on the contextual ATIS dataset).
    </span>
  </span>
);

const fields = [
    {name: "utterance", label: "Utterance", type: "TEXT_INPUT",
     placeholder: `E.g. "show me the flights from detroit to westchester county"`}
]


const ActionInfo = ({ action, tokenized_utterance }) => {
    const utterance_attention = action['utterance_attention'].map(x => [x]);
    const considered_actions = action['considered_actions'];
    const action_probs = action['action_probabilities'].map(x => [x]);

    const probability_heatmap = (
        <HeatMap colLabels={['Prob']} rowLabels={considered_actions} data={action_probs} />
    );

    const utterance_attention_heatmap = utterance_attention.length > 0 ? (
        <HeatMap colLabels={['Prob']} rowLabels={tokenized_utterance} data={utterance_attention} />
    ) : (
        ""
    )

    return (
        <div>
            {probability_heatmap}
            {utterance_attention_heatmap}
        </div>
    )
}


const Output = ({ responseData }) => {
    const { predicted_actions, entities, linking_scores, predicted_sql_query, tokenized_utterance} = responseData

    let query, internals

    if (predicted_sql_query.length > 0) {
        query = <SyntaxHighlight>{predicted_sql_query}</SyntaxHighlight>
        internals = (
            <div className="form__field">
                <Collapsible trigger="Model internals (beta)">
                    <Collapsible trigger="Predicted actions">
                        {predicted_actions.map((action, action_index) => (
                            <Collapsible key={"action_" + action_index} trigger={action['predicted_action']}>
                                <ActionInfo action={action} tokenized_utterance={tokenized_utterance}/>
                            </Collapsible>
                        ))}
                    </Collapsible>
                    <Collapsible trigger="Entity linking scores">
                        <HeatMap colLabels={tokenized_utterance} rowLabels={entities} data={linking_scores} />
                    </Collapsible>
                </Collapsible>
            </div>
        )
    } else {
        query = <p>No query found!</p>
        internals = null
    }

    return (
        <div className="model__content">
            <OutputField label="SQL Query" suppressSummary="true">
                {query}
            </OutputField>
            {internals}
        </div>
      )
}


const examples = [
    {
      utterance: "show me the flights from detroit to westchester county",
    },
    {
      utterance: "show me flights from los angeles to pittsburgh on evening 1993 march first",
    },
    {
      utterance: "give me flights on american airlines from milwaukee to phoenix",
    },
];

const apiUrl = () => `${API_ROOT}/predict/atis-parser`

const modelProps = {apiUrl, title, description, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)
