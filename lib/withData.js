import 'isomorphic-fetch'
import React from 'react'
import { ApolloProvider, getDataFromTree } from 'react-apollo'
import { initClient } from './initClient'

import { createStore, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'

const reducers = {
    // ... your other reducers here ...
    form: formReducer // <---- Mounted at 'form'
}
const reducer = combineReducers(reducers)
const store = createStore(reducer)

export default Component =>
    class extends React.Component {
        static async getInitialProps(ctx) {
            const headers = ctx.req ? ctx.req.headers : {}
            const client = initClient(headers)

            const props = {
                url: { query: ctx.query, pathname: ctx.pathname },
                ...(await (Component.getInitialProps ? Component.getInitialProps(ctx) : {}))
            }

            if (!process.browser) {
                const app = (
                    <ApolloProvider store={store} client={client}>
                        <Component {...props} />
                    </ApolloProvider>
                )
                await getDataFromTree(app)
            }

            return {
                initialState: {
                    apollo: {
                        data: client.getInitialState().data
                    }
                },
                headers,
                ...props
            }
        }

        constructor(props) {
            super(props)
            this.client = initClient(this.props.headers, this.props.initialState)
        }

        render() {
            return (
                <ApolloProvider store={store} client={this.client}>
                    <Component {...this.props} />
                </ApolloProvider>
            )
        }
    }
