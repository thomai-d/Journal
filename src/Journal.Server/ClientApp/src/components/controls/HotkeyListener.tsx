import * as React from 'react';
import { logger } from '../../util/logger';

type HotkeyDefinitions = { [hotkey: string]: () => void };

type Props = {
  hotkeys: HotkeyDefinitions,
  children: JSX.Element,
};

export const parseHotkey = (hotkey: string) => {
  const parts = hotkey.toUpperCase().split('+');
  const ctrl = parts.indexOf('CTRL') >= 0;
  const alt = parts.indexOf('ALT') >= 0;
  const shift = parts.indexOf('SHIFT') >= 0;
  const filterItems = ['CTRL', 'ALT', 'SHIFT'];
  const keys = parts.filter(p => filterItems.indexOf(p) < 0);
  if (keys.length !== 1)
    throw new Error(`Invalid hotkey: '${hotkey}`);
  return {
    ctrl,
    alt,
    shift,
    key: keys[0],
  };
};

export default (props: Props) => {

  React.useEffect(() => {

    const hotkeys = Object.entries(props.hotkeys).map(hk => ({ key: parseHotkey(hk[0]), originalKey: hk[0], action: hk[1] }));

    const onKeydown = (e: KeyboardEvent) => {
      hotkeys.forEach(hk => {
        if (hk.key.shift === e.shiftKey
         && hk.key.alt === e.altKey
         && hk.key.ctrl === e.ctrlKey
         && hk.key.key === e.key.toUpperCase()) {
           logger.debug(`Hotkey ${hk.originalKey} detected.`);
           hk.action();
         }
      });
    };

    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  });

  return props.children;
}