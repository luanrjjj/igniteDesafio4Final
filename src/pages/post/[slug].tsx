import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header'
import head from 'next/head'
import { AiOutlineCalendar,AiOutlineUser} from 'react-icons/ai'
import { BiTimeFive} from 'react-icons/bi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import React, { Fragment } from 'react';
import { useRouter } from 'next/router';
import PrismicDOM from 'prismic-dom';
import Prismic from '@prismicio/client';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string |null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}:PostProps) {

  
   
 
  //console.log(JSON.stringify(post.data.content))
  const router = useRouter ();

  if (router.isFallback) {
    return <div className = { styles.loadingMessage}>Carregando...</div>;
  }
  
  const totalTimeReading =  () => { 

  let totalTime
  let i 
 


  
  const reducer = (sumContent, thisContent) => {
    const headingWords = thisContent.heading.split(/\s/g).length;
    const bodyWords = thisContent.body.reduce((sumBody, thisBody) => {
      const textWords = thisBody.text.split(/\s/g).length;

      return sumBody + textWords;
    }, 0);
    return sumContent + headingWords + bodyWords;
  };

  const totalWord = post.data.content.reduce(reducer, 0);


  /*
   post.data.content.map(item => {
    totalWord += item.body[0]?.text

  })
  */

  console.log(300,totalWord)
  totalTime = Math.ceil(totalWord/200)
return totalTime
}
  

 const totalTime = totalTimeReading()



  return (
  <>
 
    <Header/>
  
  <main className = {styles.container}>
    {post.data.banner.url &&
  <img className= {styles.banner} src = {post.data.banner.url} alt = "banner"/>
    }
    <article className = {styles.post}>
      <h1 className={styles.title}>{post.data.title}</h1>

      <div className= {styles.DateAndAuthor}> 

      <AiOutlineCalendar className = { styles.calendaricon }></AiOutlineCalendar>
      <time> {format(new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale:ptBR,

        }
        )} </time>
      <AiOutlineUser className= {styles.usericon}></AiOutlineUser>
      <p>{post.data.author}</p>
      <BiTimeFive className= {styles.clockicon}/>
      <p>{totalTime} min</p>

      </div>

      <div className =  {styles.postContent}>
       
        {post.data.content.map(({heading,body}) => {
          return (
     <Fragment key = {heading}>
       <h2>{heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(body),
                  }}
                />
              </Fragment>
          )
       
          
       
        })}
       
    </div>
   
    </article>
  </main>

 
 
 </>
  )
  
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'pos'),
  ]);

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));
  return {
    paths:paths,
    fallback:true
  }
 };


export const getStaticProps = async ({params}) => {
  
  const {slug} = params
 
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post',String(slug),{});




  const post = {
    first_publication_date:response.first_publication_date,
    last_publication_date: response.last_publication_date,
    uid:response.uid,
    data: { 
       author:response.data.author,
       title:response.data.title,
       subtitle:response.data.subtitle,
       banner:response.data.banner,
       content:response.data.content.map (item => {
        return {
          heading:item.heading,
          body:item.body
        }
      })
 
  },
   
  }


 
  return {
    props: {
      post
    },
    redirect:60*30,
  }
 };
