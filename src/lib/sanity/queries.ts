const image = '{...,"url":asset->url,alt}';
const product = `{ "id":_id,name,"slug":slug.current,category->{"id":_id,name,"slug":slug.current},images[]${image},summary,description,features,specifications,"manual":manual.asset->url,isPopular,isNew,"relatedProducts":relatedProducts[]->_id,seo }`;
export const contentQuery = `{
 "products":*[_type=="product"] | order(name asc) ${product},
 "categories":*[_type=="productCategory"]{"id":_id,name,"slug":slug.current},
 "news":*[_type=="newsPost"] | order(date desc){"id":_id,title,"slug":slug.current,date,category,cover${image},excerpt,body,seo},
 "videos":*[_type=="video"]{"id":_id,title,thumbnail${image},url,category},
 "useCases":*[_type=="useCase"]{"id":_id,title,"slug":slug.current,image${image},description,"categories":categories[]->slug.current},
 "settings":*[_type=="siteSettings"][0]{...,logo${image}},
 "home":*[_type=="homePage"][0]{...,heroImage${image},"featuredProducts":featuredProducts[]->_id,"featuredVideos":featuredVideos[]->_id},
 "about":*[_type=="aboutPage"][0]{headline,body}
}`;
