/*
 * Copyright 2020 Hippo B.V. (http://www.onehippo.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { TYPE_LINK_EXTERNAL, isLink } from '@bloomreach/spa-sdk';

@Pipe({ name: 'isExternalLink' })
export class IsExternalLinkPipe implements PipeTransform {
  transform(value: unknown) {
    return isLink(value) && value.type === TYPE_LINK_EXTERNAL;
  }
}
