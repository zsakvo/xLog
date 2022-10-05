import { Link } from "react-scroll"

export const PostLink: React.FC<any> = ({ children, ...props }) => {
  console.log(props.href)
  if (props.href?.startsWith("#")) {
    return (
      <Link
        to={decodeURI(props.href.slice(1))}
        spy={true}
        smooth={true}
        duration={500}
        {...props}
      >
        {children}
      </Link>
    )
  } else {
    return <a {...props}>{children}</a>
  }
}
