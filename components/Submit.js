import { gql, graphql, connect, compose } from 'react-apollo'
import { reduxForm, Field } from 'redux-form'
import { Component } from 'react'
import getPost from '../lib/mutations/getPost'
import createPost from '../lib/mutations/createPost'

class Submit extends Component {
    constructor(props) {
        super(props)
        this.createPost = props.createPost
    }

    handleSubmit(e) {
        e.preventDefault()

        let title = e.target.elements.title.value
        let url = e.target.elements.url.value

        if (title === '' || url === '') {
            window.alert('Both fields are required.')
            return false
        }

        // prepend http if missing from url
        if (!url.match(/^[a-zA-Z]+:\/\//)) {
            url = `http://${url}`
        }

        this.createPost(title, url)

        // reset form
        e.target.elements.title.value = ''
        e.target.elements.url.value = ''
    }

    render() {
        return (
            <form onSubmit={e => this.handleSubmit(e)}>
                <h1>Submit</h1>
                <div>
                    <Field placeholder="title" name="title" component="input" />
                </div>
                <div>
                    <Field placeholder="url" name="url" component="input" />
                </div>
                <button type="submit">Submit</button>
                <style jsx>
                    {`
                  form {
                    border-bottom: 1px solid #ececec;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                  }
                  h1 {
                    font-size: 20px;
                  }
                  div {
                    display: block;
                    margin-bottom: 10px;
                  }
                `}
                </style>
            </form>
        )
    }
}

const SimpleForm = reduxForm({
    form: 'simple', // a unique identifier for this form
    fields: ['title', 'url'],
    enableReinitialize: true
})(Submit)

const SimpleFormContainer = compose(
    graphql(createPost, {
        props: ({ mutate }) => ({
            createPost: (title, url) =>
                mutate({
                    variables: { title, url },
                    updateQueries: {
                        allPosts: (previousResult, { mutationResult }) => {
                            const newPost = mutationResult.data.createPost
                            return Object.assign({}, previousResult, {
                                // Append the new post
                                allPosts: [newPost, ...previousResult.allPosts]
                            })
                        }
                    }
                })
        })
    }),
    graphql(getPost, {
        props: ({ data: { loading, Post } }) => {
            if (loading) {
                return { initialValues: { title: 'loading' } }
            }

            return { initialValues: { ...Post } }
        }
    })
)(SimpleForm)

export default SimpleFormContainer
