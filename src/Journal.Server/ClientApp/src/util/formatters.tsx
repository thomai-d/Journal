import { Typography } from '@material-ui/core';
import React from 'react';

const pad = (n: number, pad: number) => {
  let str = n.toString();
  while (str.length < pad) {
    str = '0' + str;
  }
  return str;
}

export const formatDate = (dateStr: string) => {
  const date = new Date(Date.parse(dateStr));
  return `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)} ${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}`;
}

export const formatText = (text: string) => {
  const lines = text.split('\n')
                    .map((line, n) => <Typography key={n} variant="body1">{line}</Typography>);
  return <>{lines}</>;
}