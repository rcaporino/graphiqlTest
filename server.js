const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql');
const db = require('./db');
const app = express();

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author of a book',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: async (author) => {
        // return books.filter(book => book.authorid === author.id)
        const statement = 'select * from books where authorid = $1';
        const values = [author.id];
        const data = await db.query(statement, values);
        return data.rows;
      }
    }
  })
})

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a book written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorid: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      //need to change this to match db requirements
      resolve: async (book) => {
        // return authors.find(author => author.id === book.authorid);
        const statement = 'select * from authors where id = $1';
        const values = [book.authorid];
        const data = await db.query(statement, values);
        return data.rows[0];
      }
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    book: {
      type: BookType,
      description: 'A single Book',
      args: {
        id: { type: GraphQLInt }
      },
      //db query instead to get this
      resolve: async (parent, args) => {
        // books.find(book => book.id === args.id)
        const statement = 'select * from books where id = $1';
        const values = [args.id];
        const data = await db.query(statement, values);
        return data.rows[0];
      }
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of Books',
      //query db in resolve instead of returning the books object
      resolve: async () => {
        const statement = 'select * from books';
        const data = await db.query(statement);
        return data.rows;
        // db.query(statement)
        //   .then(data => data.rows);
      }
    },
    author: {
      type: AuthorType,
      description: 'A Single Author',
      args: {
        id: { type: GraphQLInt }
      },
      //query db in resolve instead of returning the books object
      resolve: async (parent, args) => {
        // authors.find(author => author.id === args.id)
        const statement = 'select * from authors where id = $1';
        const values = [args.id];
        const data = await db.query(statement, values);
        return data.rows[0];
      }
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of all Authors',
      //query db in resolve instead of returning the books object
      resolve: async () => {
        const statement = 'select * from authors';
        const data = await db.query(statement);
        return data.rows;
      }
    }
  })
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutations',
  description: 'Root Mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Add a Book',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorid: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: async (parent, args) => {
        const statement = 'insert into books (name, authorid) values ($1, $2) returning *';
        const values = [args.name, args.authorid];
        const data = await db.query(statement, values); 
        return data.rows[0];
      }
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an Author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      //change this to db query
      resolve: async (parent, args) => {
        // const author = { id: authors.length + 1, name: args.name };
        // authors.push(author);
        // return author;
        const statement = 'insert into authors (name) values ($1) returning *';
        const values = [args.name];
        const data = await db.query(statement, values); 
        return data.rows[0];
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}))

app.listen(5000, () => console.log('Server is Running'));