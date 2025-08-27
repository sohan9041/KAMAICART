--
-- PostgreSQL database dump
--

-- Dumped from database version 17.3
-- Dumped by pg_dump version 17.3

-- Started on 2025-08-26 12:33:09

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 875 (class 1247 OID 33433)
-- Name: admin_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.admin_role AS ENUM (
    'admin',
    'super_admin'
);


ALTER TYPE public.admin_role OWNER TO postgres;

--
-- TOC entry 923 (class 1247 OID 33681)
-- Name: banner_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.banner_type AS ENUM (
    'web',
    'app'
);


ALTER TYPE public.banner_type OWNER TO postgres;

--
-- TOC entry 899 (class 1247 OID 33558)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'seller',
    'trader',
    'seller_trader',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 33437)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phoneno character varying(20) NOT NULL,
    password text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    role_id integer,
    "profileImage" character varying,
    CONSTRAINT user_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 33444)
-- Name: admindata_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admindata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admindata_id_seq OWNER TO postgres;

--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 218
-- Name: admindata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admindata_id_seq OWNED BY public."user".id;


--
-- TOC entry 242 (class 1259 OID 33646)
-- Name: attribute_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attribute_values (
    id bigint NOT NULL,
    attribute_id bigint NOT NULL,
    value character varying(255) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.attribute_values OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 33645)
-- Name: attribute_values_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attribute_values_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attribute_values_id_seq OWNER TO postgres;

--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 241
-- Name: attribute_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attribute_values_id_seq OWNED BY public.attribute_values.id;


--
-- TOC entry 240 (class 1259 OID 33631)
-- Name: attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attributes (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    category_id bigint NOT NULL,
    input_type character varying(50),
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    CONSTRAINT attributes_input_type_check CHECK (((input_type)::text = ANY ((ARRAY['text'::character varying, 'dropdown'::character varying, 'color'::character varying, 'number'::character varying])::text[])))
);


ALTER TABLE public.attributes OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 33630)
-- Name: attributes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attributes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attributes_id_seq OWNER TO postgres;

--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 239
-- Name: attributes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attributes_id_seq OWNED BY public.attributes.id;


--
-- TOC entry 246 (class 1259 OID 33686)
-- Name: banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banners (
    id integer NOT NULL,
    image character varying(255) NOT NULL,
    type public.banner_type NOT NULL,
    is_delete boolean DEFAULT false,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.banners OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 33685)
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banners_id_seq OWNER TO postgres;

--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 245
-- Name: banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;


--
-- TOC entry 219 (class 1259 OID 33445)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    parent_id integer,
    unique_code character varying(50),
    is_delete boolean DEFAULT false,
    image character varying
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 33450)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 220
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 232 (class 1259 OID 33570)
-- Name: general_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.general_settings (
    id integer NOT NULL,
    site_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    address text,
    logo character varying(500),
    timezone character varying(100) DEFAULT 'UTC'::character varying,
    currency character varying(10) DEFAULT 'USD'::character varying,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    favicon character varying
);


ALTER TABLE public.general_settings OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 33569)
-- Name: general_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.general_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.general_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 231
-- Name: general_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.general_settings_id_seq OWNED BY public.general_settings.id;


--
-- TOC entry 221 (class 1259 OID 33451)
-- Name: product_colors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_colors (
    id integer NOT NULL,
    product_id integer,
    color text
);


ALTER TABLE public.product_colors OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 33456)
-- Name: product_colors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_colors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_colors_id_seq OWNER TO postgres;

--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 222
-- Name: product_colors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_colors_id_seq OWNED BY public.product_colors.id;


--
-- TOC entry 223 (class 1259 OID 33457)
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer,
    image_url text NOT NULL
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 33462)
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_id_seq OWNER TO postgres;

--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 224
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- TOC entry 225 (class 1259 OID 33463)
-- Name: product_sizes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_sizes (
    id integer NOT NULL,
    product_id integer,
    size text
);


ALTER TABLE public.product_sizes OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 33468)
-- Name: product_sizes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_sizes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_sizes_id_seq OWNER TO postgres;

--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 226
-- Name: product_sizes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_sizes_id_seq OWNED BY public.product_sizes.id;


--
-- TOC entry 244 (class 1259 OID 33662)
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    sku character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 33661)
-- Name: product_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_variants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_variants_id_seq OWNER TO postgres;

--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 243
-- Name: product_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_variants_id_seq OWNED BY public.product_variants.id;


--
-- TOC entry 227 (class 1259 OID 33469)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    short_description text,
    shop_id numeric(10,2),
    category_id numeric(10,2),
    brand text,
    description text,
    status text,
    is_deleted integer DEFAULT 0,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 33476)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 228
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 236 (class 1259 OID 33596)
-- Name: role_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_features (
    id integer NOT NULL,
    role_id integer NOT NULL,
    feature character varying(255) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_features OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 33595)
-- Name: role_features_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_features_id_seq OWNER TO postgres;

--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 235
-- Name: role_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_features_id_seq OWNED BY public.role_features.id;


--
-- TOC entry 234 (class 1259 OID 33585)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    button_text character varying(255),
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    icon character varying(255),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 33584)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 233
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 238 (class 1259 OID 33616)
-- Name: why_choose; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.why_choose (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    icon character varying(255) NOT NULL,
    is_delete boolean DEFAULT false,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.why_choose OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 33615)
-- Name: why_choose_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.why_choose_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.why_choose_id_seq OWNER TO postgres;

--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 237
-- Name: why_choose_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.why_choose_id_seq OWNED BY public.why_choose.id;


--
-- TOC entry 229 (class 1259 OID 33477)
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 33481)
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wishlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlists_id_seq OWNER TO postgres;

--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 230
-- Name: wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wishlists_id_seq OWNED BY public.wishlists.id;


--
-- TOC entry 4808 (class 2604 OID 33649)
-- Name: attribute_values id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute_values ALTER COLUMN id SET DEFAULT nextval('public.attribute_values_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 33634)
-- Name: attributes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes ALTER COLUMN id SET DEFAULT nextval('public.attributes_id_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 33689)
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 33483)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4788 (class 2604 OID 33573)
-- Name: general_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.general_settings ALTER COLUMN id SET DEFAULT nextval('public.general_settings_id_seq'::regclass);


--
-- TOC entry 4780 (class 2604 OID 33484)
-- Name: product_colors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_colors ALTER COLUMN id SET DEFAULT nextval('public.product_colors_id_seq'::regclass);


--
-- TOC entry 4781 (class 2604 OID 33485)
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- TOC entry 4782 (class 2604 OID 33486)
-- Name: product_sizes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sizes ALTER COLUMN id SET DEFAULT nextval('public.product_sizes_id_seq'::regclass);


--
-- TOC entry 4812 (class 2604 OID 33665)
-- Name: product_variants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants ALTER COLUMN id SET DEFAULT nextval('public.product_variants_id_seq'::regclass);


--
-- TOC entry 4783 (class 2604 OID 33487)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 33599)
-- Name: role_features id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_features ALTER COLUMN id SET DEFAULT nextval('public.role_features_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 33588)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4774 (class 2604 OID 33482)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.admindata_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 33619)
-- Name: why_choose id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.why_choose ALTER COLUMN id SET DEFAULT nextval('public.why_choose_id_seq'::regclass);


--
-- TOC entry 4786 (class 2604 OID 33488)
-- Name: wishlists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists ALTER COLUMN id SET DEFAULT nextval('public.wishlists_id_seq'::regclass);


--
-- TOC entry 5047 (class 0 OID 33646)
-- Dependencies: 242
-- Data for Name: attribute_values; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5045 (class 0 OID 33631)
-- Dependencies: 240
-- Data for Name: attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5051 (class 0 OID 33686)
-- Dependencies: 246
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.banners (id, image, type, is_delete, "createdAt", "updatedAt") VALUES (1, '/uploads/banner/1756104771533-gallery-2.jpg', 'app', false, '2025-08-25 06:52:51.571', '2025-08-25 06:52:51.571');


--
-- TOC entry 5024 (class 0 OID 33445)
-- Dependencies: 219
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (16, 'All Sarees', 'all-sarees', 8, 'ALL_SAREES', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (51, 'Black Sareesss', 'black-sareesss', 8, 'BLACK_SAREESSS', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (1, 'Women Ethnic', 'women', NULL, 'WOMEN_ETHNIC', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (2, 'Women Western', 'ledis', NULL, 'WOMEN_WESTERN', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (4, 'Kids', 'kids', NULL, 'KIDS', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (7, 'Electronics', 'electronics', NULL, 'ELECTRONICS', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (10, 'Dress', 'dress', 1, 'DRESS', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (11, 'OtherEthenic', 'otherethenic', 1, 'OTHERETHENIC', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (12, 'Topwere', 'topwere', 2, 'TOPWERE', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (17, 'Footwere', 'footwere', NULL, 'FOOTWERE', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (3, 'Mens', 'mens', NULL, 'MENS', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (5, 'Homes', 'homes', NULL, 'HOMES', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (8, 'Sarees', 'sarees', 1, 'SAREES', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (18, 'Sendal', 'sendal', 17, 'SENDAL', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (20, 'Shoes', 'shoes', 17, 'SHOES', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (13, 'Bottomwere', 'bottomwere', 2, 'BOTTOMWERE', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (15, 'Sportwere', 'sportwere', 2, 'SPORTWERE', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (36, 'Sohan', 'sohan', NULL, 'SOHAN', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (37, 'Gohel', 'gohel', NULL, 'GOHEL', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (39, 'hi2', 'hi2', NULL, 'HI2', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (40, 'hi3', 'hi3', NULL, 'HI3', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (41, 'hi4', 'hi4', NULL, 'HI4', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (24, 'Sneckers', 'sneckers', 20, 'SNECKERS', false, NULL);
INSERT INTO public.categories (id, name, slug, parent_id, unique_code, is_delete, image) VALUES (38, 'RAVAN', 'RAVAN', NULL, 'RAVAN', false, NULL);


--
-- TOC entry 5037 (class 0 OID 33570)
-- Dependencies: 232
-- Data for Name: general_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.general_settings (id, site_name, email, phone, address, logo, timezone, currency, "createdAt", "updatedAt", favicon) VALUES (1, 'My Awesome App', 'admin@example.com', '+91-9876543210', 'Mumbai, India', '/uploads/settings/1755690461709-527099669.png', 'UTC', 'USD', '2025-08-20 11:38:43.487', '2025-08-20 11:47:41.725', NULL);


--
-- TOC entry 5026 (class 0 OID 33451)
-- Dependencies: 221
-- Data for Name: product_colors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.product_colors (id, product_id, color) VALUES (1, 2, 'Red');
INSERT INTO public.product_colors (id, product_id, color) VALUES (2, 2, 'Blue');
INSERT INTO public.product_colors (id, product_id, color) VALUES (3, 3, 'Black');
INSERT INTO public.product_colors (id, product_id, color) VALUES (4, 4, 'Black');
INSERT INTO public.product_colors (id, product_id, color) VALUES (5, 5, 'Violet');
INSERT INTO public.product_colors (id, product_id, color) VALUES (6, 6, 'Green');
INSERT INTO public.product_colors (id, product_id, color) VALUES (7, 6, 'White');
INSERT INTO public.product_colors (id, product_id, color) VALUES (8, 6, 'Black');
INSERT INTO public.product_colors (id, product_id, color) VALUES (9, 8, 'Maroon');
INSERT INTO public.product_colors (id, product_id, color) VALUES (10, 8, 'Black');
INSERT INTO public.product_colors (id, product_id, color) VALUES (11, 8, 'Green');
INSERT INTO public.product_colors (id, product_id, color) VALUES (12, 9, 'Violet');
INSERT INTO public.product_colors (id, product_id, color) VALUES (13, 10, 'Green');
INSERT INTO public.product_colors (id, product_id, color) VALUES (14, 10, 'Black');
INSERT INTO public.product_colors (id, product_id, color) VALUES (15, 10, 'White');
INSERT INTO public.product_colors (id, product_id, color) VALUES (16, 11, 'Yellow');


--
-- TOC entry 5028 (class 0 OID 33457)
-- Dependencies: 223
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.product_images (id, product_id, image_url) VALUES (15, 1, 'https://res.cloudinary.com/kalibhai/image/upload/v1751631535/products/og2wjdomknootudhkzxo.png');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (16, 1, 'https://res.cloudinary.com/kalibhai/image/upload/v1751631535/products/pkdq2v8jmtzxi5zekunf.png');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (17, 1, 'https://res.cloudinary.com/kalibhai/image/upload/v1751631599/products/cnifibel1fndkur1uvba.png');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (18, 1, 'https://res.cloudinary.com/kalibhai/image/upload/v1751631599/products/vgu2taboijyk6qchzeja.png');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (19, 2, 'https://res.cloudinary.com/kalibhai/image/upload/v1751696601/products/nj2vustgl9ddonh0tjzp.png');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (20, 2, 'https://res.cloudinary.com/kalibhai/image/upload/v1751696602/products/agqqmgx2wmjfnpz0swex.jpg');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (21, 3, 'https://res.cloudinary.com/kalibhai/image/upload/v1751718118/products/vhurzhztnxsziepd5zu5.png');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (22, 4, 'https://res.cloudinary.com/kalibhai/image/upload/v1751866452/products/opgnlpc3sooskefox39g.jpg');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (23, 4, 'https://res.cloudinary.com/kalibhai/image/upload/v1751866451/products/x6rkslcqeg7ctu2pelxg.jpg');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (24, 5, 'https://res.cloudinary.com/kalibhai/image/upload/v1751873467/products/awgeivy4fublce2kryyv.jpg');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (25, 6, 'https://res.cloudinary.com/kalibhai/image/upload/v1751884247/products/x6mq5tiymz2jic74fdss.jpg');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (26, 8, 'https://res.cloudinary.com/kalibhai/image/upload/v1754043022/products/ks9bunqvlm9lbjxeqgck.jpg');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (27, 8, 'https://res.cloudinary.com/kalibhai/image/upload/v1754043023/products/ynq6ecoqzccdsz62fky2.png');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (28, 9, 'https://res.cloudinary.com/kalibhai/image/upload/v1754043675/products/k0d3ukx6ycwhqbkddwhq.png');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (29, 10, 'https://res.cloudinary.com/kalibhai/image/upload/v1754292187/products/dw62ekowatxndrpawdbx.jpg');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (30, 10, 'https://res.cloudinary.com/kalibhai/image/upload/v1754292187/products/qntmeczwkqsolkfto8lx.jpg');
INSERT INTO public.product_images (id, product_id, image_url) VALUES (31, 11, 'https://res.cloudinary.com/kalibhai/image/upload/v1754292685/products/urrdfpoyvvfavw2nz1no.png');


--
-- TOC entry 5030 (class 0 OID 33463)
-- Dependencies: 225
-- Data for Name: product_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.product_sizes (id, product_id, size) VALUES (1, 2, 'M');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (2, 2, 'L');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (3, 2, 'XL');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (4, 3, '4XL');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (5, 4, '4XL');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (6, 5, '26');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (7, 6, '30');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (8, 8, 'M');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (9, 8, '38');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (10, 8, 'Free Size');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (11, 9, 'XL');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (12, 10, 'XL');
INSERT INTO public.product_sizes (id, product_id, size) VALUES (13, 11, 'XL');


--
-- TOC entry 5049 (class 0 OID 33662)
-- Dependencies: 244
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5032 (class 0 OID 33469)
-- Dependencies: 227
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products (id, name, short_description, shop_id, category_id, brand, description, status, is_deleted, "createdAt", "updatedAt") VALUES (1, 'Demo Product', 'This is a sample product', 999.00, 500.00, 'nike', 'male', 'cottern', 15, '2025-07-04 17:48:04.401368', 'firstclass');
INSERT INTO public.products (id, name, short_description, shop_id, category_id, brand, description, status, is_deleted, "createdAt", "updatedAt") VALUES (2, 'Demo Product\t', 'This is a sample product', 999.00, 499.00, 'Nike', 'male', 'Cotton', 20, '2025-07-05 11:53:21.760443', 'Casual');
INSERT INTO public.products (id, name, short_description, shop_id, category_id, brand, description, status, is_deleted, "createdAt", "updatedAt") VALUES (3, 'Radha', '-----------------', 7874.00, 9041.00, 'Universal', 'female', 'Fabric', 111, '2025-07-05 17:51:59.570842', 'Silk');
INSERT INTO public.products (id, name, short_description, shop_id, category_id, brand, description, status, is_deleted, "createdAt", "updatedAt") VALUES (4, 'Patoda', 'Patan Patoda', 1100.00, 1300.00, 'Patan', 'male', 'silk', 86, '2025-07-07 11:04:11.794929', 'printed');
INSERT INTO public.products (id, name, short_description, shop_id, category_id, brand, description, status, is_deleted, "createdAt", "updatedAt") VALUES (5, 'sendle of new brand', 'campus sandle', 7874.00, 9041.00, 'Campus', 'male', 'cotton', 111, '2025-07-07 13:01:07.305316', 'unique');
INSERT INTO public.products (id, name, short_description, shop_id, category_id, brand, description, status, is_deleted, "createdAt", "updatedAt") VALUES (6, 'sandle new fashion new type', 'gohel', 110.00, 109.00, 'adidas', 'male', 'silk', 109, '2025-07-07 16:00:47.819717', 'printed');
INSERT INTO public.products (id, name, short_description, shop_id, category_id, brand, description, status, is_deleted, "createdAt", "updatedAt") VALUES (8, 'PurpleSAreee', 'sareee bestmaterial', 1200.00, 1500.00, 'sagun', 'female', 'Cotton', 10, '2025-08-01 15:40:24.443411', 'cotton');
INSERT INTO public.products (id, name, short_description, shop_id, category_id, brand, description, status, is_deleted, "createdAt", "updatedAt") VALUES (9, 'sejhewj`', 'ksdlgvsdlsd', 11.00, 111.00, '`gskljsf1`', 'male', 'ssss', 62, '2025-08-01 15:51:16.649879', 'printed');
INSERT INTO public.products (id, name, short_description, shop_id, category_id, brand, description, status, is_deleted, "createdAt", "updatedAt") VALUES (10, 'T-Shirt', 'Importent Tshirt', 1200.00, 1500.00, 'POLO', 'male', 'Lycra`', 100, '2025-08-04 12:53:08.793914', 'Design');
INSERT INTO public.products (id, name, short_description, shop_id, category_id, brand, description, status, is_deleted, "createdAt", "updatedAt") VALUES (11, 'warfwa', 'adfdfwa', 121.00, 213123.00, 'fwafrw', 'male', '32321', 123, '2025-08-04 13:01:26.724419', '232');


--
-- TOC entry 5041 (class 0 OID 33596)
-- Dependencies: 236
-- Data for Name: role_features; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.role_features (id, role_id, feature, "createdAt", "updatedAt") VALUES (1, 1, 'View Dashboard', '2025-08-21 06:19:04.737', '2025-08-21 06:19:04.738');


--
-- TOC entry 5039 (class 0 OID 33585)
-- Dependencies: 234
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, name, description, button_text, "createdAt", "updatedAt", icon, is_deleted) VALUES (1, 'Platform Admin', 'admin role with product management access', 'Admin Access', '2025-08-21 05:55:34.004', '2025-08-21 05:55:34.006', '/uploads/icon/icon_1755760432851.png', false);
INSERT INTO public.roles (id, name, description, button_text, "createdAt", "updatedAt", icon, is_deleted) VALUES (2, 'Token Trader', 'Focus on token investments and portfolio management', 'Start Token Trading', '2025-08-21 07:13:52.956', '2025-08-21 07:13:52.958', '/uploads/icon/icon_1755760432851.png', false);
INSERT INTO public.roles (id, name, description, button_text, "createdAt", "updatedAt", icon, is_deleted) VALUES (3, 'Vendor/Seller', 'Sell products, launch tokens, and build your business', 'Start Selling & Earn', '2025-08-21 07:15:29.226', '2025-08-21 07:15:29.226', '/uploads/icon/icon_1755760529128.png', false);
INSERT INTO public.roles (id, name, description, button_text, "createdAt", "updatedAt", icon, is_deleted) VALUES (4, 'Customer', 'Focus on token investments and portfolio management', 'Start Shopping', '2025-08-25 05:29:35.701', '2025-08-25 05:29:35.703', NULL, false);


--
-- TOC entry 5022 (class 0 OID 33437)
-- Dependencies: 217
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."user" (id, name, email, phoneno, password, created_at, updated_at, status, role_id, "profileImage") VALUES (1, 'sohan', 'sohansohan304@gmail.com', '9876543210', '$2b$10$WPcGkWc86WtWihMyhhyZfummSPmhelUhLdBHVktc/86tjBxT9y2Q2', '2025-08-13 15:33:47.566621+05:30', '2025-08-13 15:33:47.56662+05:30', 'active', 1, NULL);
INSERT INTO public."user" (id, name, email, phoneno, password, created_at, updated_at, status, role_id, "profileImage") VALUES (2, 'admin', 'admin@gmail.com', '9999999999', '$2b$10$r7a7H1PCakPJOiawk7bP5OjAreWE/xFovfWLFXUmbikai5NSXzdzi', '2025-08-20 12:09:22.455084+05:30', '2025-08-20 12:09:22.455084+05:30', 'active', 1, NULL);
INSERT INTO public."user" (id, name, email, phoneno, password, created_at, updated_at, status, role_id, "profileImage") VALUES (3, 'admin', 'admin2@gmail.com', '9999999998', '$2b$10$4GpWmFbMK8WwPd1lOpC.xeaSaEnF3EI1H2mbwOu7GBXDdtiyIKnzq', '2025-08-20 12:35:28.541108+05:30', '2025-08-20 12:35:28.541108+05:30', 'active', 1, NULL);
INSERT INTO public."user" (id, name, email, phoneno, password, created_at, updated_at, status, role_id, "profileImage") VALUES (8, 'seller', 'seller@gmail.com', '6666666', '$2b$10$lnUDMVnUAM7YhaAwS4dok.Dq8Quyu7aRP03DdLr933w3n0JJxS6jW', '2025-08-25 12:32:29.665448+05:30', '2025-08-25 12:32:29.665448+05:30', 'active', 3, NULL);
INSERT INTO public."user" (id, name, email, phoneno, password, created_at, updated_at, status, role_id, "profileImage") VALUES (7, 'user', 'user@gmail.com', '999999999890', '$2b$10$GU9m81k4Z5W5MQP2lIMF8eEZ28tiXbNG4CZvZIaPb1kqPAw4Xdbfi', '2025-08-25 11:08:27.850317+05:30', '2025-08-25 11:08:27.850317+05:30', 'active', 4, '/uploads/user/profileImage_1756191039634.jpg');


--
-- TOC entry 5043 (class 0 OID 33616)
-- Dependencies: 238
-- Data for Name: why_choose; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5034 (class 0 OID 33477)
-- Dependencies: 229
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 218
-- Name: admindata_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admindata_id_seq', 8, true);


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 241
-- Name: attribute_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribute_values_id_seq', 1, false);


--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 239
-- Name: attributes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attributes_id_seq', 1, false);


--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 245
-- Name: banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banners_id_seq', 1, true);


--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 220
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 51, true);


--
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 231
-- Name: general_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.general_settings_id_seq', 1, true);


--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 222
-- Name: product_colors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_colors_id_seq', 16, true);


--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 224
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 31, true);


--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 226
-- Name: product_sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_sizes_id_seq', 13, true);


--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 243
-- Name: product_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_variants_id_seq', 1, false);


--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 228
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 11, true);


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 235
-- Name: role_features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_features_id_seq', 1, true);


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 233
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 8, true);


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 237
-- Name: why_choose_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.why_choose_id_seq', 1, false);


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 230
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wishlists_id_seq', 1, false);


--
-- TOC entry 4825 (class 2606 OID 33490)
-- Name: user admindata_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT admindata_email_key UNIQUE (email);


--
-- TOC entry 4827 (class 2606 OID 33492)
-- Name: user admindata_phone_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT admindata_phone_no_key UNIQUE (phoneno);


--
-- TOC entry 4829 (class 2606 OID 33494)
-- Name: user admindata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT admindata_pkey PRIMARY KEY (id);


--
-- TOC entry 4860 (class 2606 OID 33653)
-- Name: attribute_values attribute_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute_values
    ADD CONSTRAINT attribute_values_pkey PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 33639)
-- Name: attributes attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT attributes_pkey PRIMARY KEY (id);


--
-- TOC entry 4866 (class 2606 OID 33694)
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 33496)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 33498)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 4835 (class 2606 OID 33500)
-- Name: categories categories_unique_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_unique_code_key UNIQUE (unique_code);


--
-- TOC entry 4849 (class 2606 OID 33581)
-- Name: general_settings general_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.general_settings
    ADD CONSTRAINT general_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4837 (class 2606 OID 33502)
-- Name: product_colors product_colors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_colors
    ADD CONSTRAINT product_colors_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 33504)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4841 (class 2606 OID 33506)
-- Name: product_sizes product_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sizes
    ADD CONSTRAINT product_sizes_pkey PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 33672)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 33508)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4854 (class 2606 OID 33603)
-- Name: role_features role_features_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_features
    ADD CONSTRAINT role_features_pkey PRIMARY KEY (id);


--
-- TOC entry 4851 (class 2606 OID 33594)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4864 (class 2606 OID 33674)
-- Name: product_variants uq_product_sku; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT uq_product_sku UNIQUE (product_id, sku);


--
-- TOC entry 4856 (class 2606 OID 33625)
-- Name: why_choose why_choose_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.why_choose
    ADD CONSTRAINT why_choose_pkey PRIMARY KEY (id);


--
-- TOC entry 4845 (class 2606 OID 33512)
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- TOC entry 4847 (class 2606 OID 33514)
-- Name: wishlists wishlists_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- TOC entry 4852 (class 1259 OID 33609)
-- Name: idx_role_features_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_features_role_id ON public.role_features USING btree (role_id);


--
-- TOC entry 4868 (class 2606 OID 33515)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 4875 (class 2606 OID 33654)
-- Name: attribute_values fk_attribute; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute_values
    ADD CONSTRAINT fk_attribute FOREIGN KEY (attribute_id) REFERENCES public.attributes(id) ON DELETE CASCADE;


--
-- TOC entry 4874 (class 2606 OID 33640)
-- Name: attributes fk_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 4873 (class 2606 OID 33604)
-- Name: role_features fk_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_features
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 4867 (class 2606 OID 33610)
-- Name: user fk_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 4869 (class 2606 OID 33520)
-- Name: product_colors product_colors_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_colors
    ADD CONSTRAINT product_colors_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4870 (class 2606 OID 33525)
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4871 (class 2606 OID 33530)
-- Name: product_sizes product_sizes_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sizes
    ADD CONSTRAINT product_sizes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4876 (class 2606 OID 33675)
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4872 (class 2606 OID 33540)
-- Name: wishlists wishlists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


-- Completed on 2025-08-26 12:33:09

--
-- PostgreSQL database dump complete
--

