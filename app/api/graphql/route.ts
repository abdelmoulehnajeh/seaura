import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';
import { query } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { getServerSession } from "next-auth/next";

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    role: String!
  }

  type Category {
    id: ID!
    name: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    image_url: String
    category_id: ID
    created_at: String
  }

  type HomeContent {
    id: ID!
    key: String!
    value: String!
    type: String!
    section: String
  }

  type NewsletterEntry {
    id: ID!
    email: String!
    created_at: String
  }

  type Query {
    products: [Product!]!
    categories: [Category!]!
    homeContent: [HomeContent!]!
    newsletter: [NewsletterEntry!]!
    me: User
  }

  type Mutation {
    createProduct(name: String!, description: String, price: Float!, image_url: String, category_id: ID): Product!
    deleteProduct(id: ID!): Boolean!
    updateHomeContent(key: String!, value: String!, type: String!, section: String): HomeContent!
    subscribeNewsletter(email: String!): Boolean!
  }
`;

const resolvers = {
    Query: {
        products: async () => {
            const res = await query("SELECT * FROM products ORDER BY created_at DESC");
            return res.rows;
        },
        categories: async () => {
            const res = await query("SELECT * FROM categories");
            return res.rows;
        },
        homeContent: async () => {
            const res = await query("SELECT * FROM home_content");
            return res.rows;
        },
        newsletter: async (_: any, __: any, context: any) => {
            if (context.session?.user?.role !== 'ADMIN') throw new Error('Not authorized');
            const res = await query("SELECT * FROM newsletter ORDER BY created_at DESC");
            return res.rows;
        },
        me: async (_: any, __: any, context: any) => {
            return context.session?.user;
        }
    },
    Mutation: {
        createProduct: async (_: any, { name, description, price, image_url, category_id }: any, context: any) => {
            if (context.session?.user?.role !== 'ADMIN') throw new Error('Not authorized');
            const res = await query(
                "INSERT INTO products (name, description, price, image_url, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [name, description, price, image_url, category_id]
            );
            return res.rows[0];
        },
        deleteProduct: async (_: any, { id }: any, context: any) => {
            if (context.session?.user?.role !== 'ADMIN') throw new Error('Not authorized');
            await query("DELETE FROM products WHERE id = $1", [id]);
            return true;
        },
        updateHomeContent: async (_: any, { key, value, type, section }: any, context: any) => {
            if (context.session?.user?.role !== 'ADMIN') throw new Error('Not authorized');
            const res = await query(
                `INSERT INTO home_content (key, value, type, section) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE 
         SET value = EXCLUDED.value, type = EXCLUDED.type, section = EXCLUDED.section, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
                [key, value, type, section]
            );
            return res.rows[0];
        },
        subscribeNewsletter: async (_: any, { email }: any) => {
            await query(
                "INSERT INTO newsletter (email) VALUES ($1) ON CONFLICT (email) DO NOTHING",
                [email]
            );
            return true;
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
    context: async (req, res) => {
        const session = await getServerSession(authOptions);
        return { req, res, session };
    }
});

export { handler as GET, handler as POST };
