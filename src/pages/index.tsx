import { GetStaticProps } from 'next';
import { apiResolver } from 'next/dist/next-server/server/api-utils';
import Prismic from '@prismicio/client'
import { AiOutlineCalendar,AiOutlineUser} from 'react-icons/ai'
import Head from "next/head"
import { getPrismicClient } from '../services/prismic';
import {useState,useEffect} from 'react';
import  Link from 'next/link'
import Header from '../components/Header'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useRouter } from 'next/router';

import {postFormatter} from '../services/formattingData'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
 
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostsProps {
  posts: Post []
}

interface PostPagination {
  next_page: string;

  results: Post[];
}

interface HomeProps {
  postPagination: PostPagination;
  preview:boolean;
}

export default function Home({postPagination,preview}:HomeProps) {

  const [nextPage,setNextPage] = useState(postPagination?.next_page);
  const [posts,setPosts] = useState(postPagination?.results);
  


async function loadMorePosts () {

  await fetch(nextPage ? nextPage:'')
  .then (response => response.json())
  .then(data => {
    const formattedData =  postFormatter(data);
      setPosts( [...posts,...formattedData?.results])
      setNextPage(formattedData?.next_page)

    })
  }





  const router = useRouter()
return (

  <>
  <Head>
    <title> Posts| Ignews</title>
  </Head>

 <Header/>
 <div className = { styles.posts}>
    {posts.map(post => (
      <>
      <Link href = {`/post/${post.uid}`}  key = {post.uid} >
      <a>
      <strong>{post.data.title}</strong>
      <p>{post.data.subtitle}</p>
      <div className= {styles.DateAndAuthor}> 
      <AiOutlineCalendar className = { styles.calendaricon }></AiOutlineCalendar>
      <time> {format(new Date(post.first_publication_date),
        'dd-MM-yyyy',
        {
          locale:ptBR,

        }
        )} </time>
      <AiOutlineUser className= {styles.usericon}></AiOutlineUser>
      <p>{post.data.author}</p>
      </div>

      </a>
      </Link>
</>
      ))
    }

    {nextPage? (
<button className = {styles.LoadMore} onClick = {loadMorePosts}>
  Carregar mais posts
</button>
    )
:null
}
</div>
  
  </>
    
)
}


export const getStaticProps= async ({
 preview=false,
  previewData,
}) => {


  const prismic = getPrismicClient();
  
  
  
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type','post')],
    {
      fetch:['document.type','post'],
      pageSize:1,
      ref:previewData?.ref??null,
    } 
  ); 

  
  const postPagination = postFormatter(postsResponse)

  return {
    props: {postPagination,preview },
  };


}
