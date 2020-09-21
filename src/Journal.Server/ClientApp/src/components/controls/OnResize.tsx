import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';

const useStyle = makeStyles(() => ({
  container: {
    flex: '1 1 0',
    overflow: 'hidden',
  },
}));

type Props = {
  render: (width: number, height: number) => JSX.Element,
};

export default (props: Props) => {

  const containerRef = useRef<HTMLDivElement>(null);
  const classes = useStyle();
  const [ width, setWidth ] = useState(0);
  const [ height, setHeight ] = useState(0);

  useEffect(() => {
    if (containerRef && containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
      setHeight(containerRef.current.offsetHeight);
    }

    const onResized = () => {
      setWidth(containerRef.current!.offsetWidth);
      setHeight(containerRef.current!.offsetHeight);
    };

    window.addEventListener('resize', onResized);
    return () => window.removeEventListener('resize', onResized);
  }, []);

  const content = (width && height)
                  ? props.render(width, height)
                  : null;

  return (
    <div className={`${classes.container}`} ref={containerRef}>
      {content}
    </div>
  );
}