from copy import deepcopy

from dataclasses import dataclass

from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Tuple


config: Dict[str, Any] = {
    'environment': {
        'demo': {
            'pipeline': 'DemoDeploymentPipelineStack',
            'tags': [
                ('time-to-live-hours', '36'),
            ],
        },
        'dev': {
            'pipeline': 'DemoDeploymentPipelineStack',
            'backend_url': 'https://igvfd-dev.demo.igvf.org',
            'tags': [
            ],
        },
        'main': {
            'staging': {},
            'test': {},
            'prod': {},
        }
    }
}


@dataclass
class Common:
    organization_name: str = 'igvf-dacc'
    project_name: str = 'igvf-ui'
    default_region: str = 'us-west-2'
    aws_cdk_version: str = '2.21.0'


@dataclass
class Config:
    name: str
    branch: str
    pipeline: str
    backend_url: str
    tags: List[Tuple[str, str]]
    common: Common = Common()


def get_raw_config_from_name(name: str, **kwargs: Any) -> Dict[str, Any]:
    return {
        **config['environment'][name],
        **kwargs,
        **{'name': name},
    }


def maybe_add_backend_url(calculated_config: Dict[str, Any]) -> None:
    if 'backend_url' not in calculated_config:
        calculated_config['backend_url'] = get_backend_url_from_branch(
            calculated_config['branch']
        )


def fill_in_calculated_config(raw_config: Dict[str, Any]) -> Dict[str, Any]:
    calculated_config = deepcopy(raw_config)
    maybe_add_backend_url(calculated_config)
    return calculated_config


def config_factory(**kwargs: Any) -> Config:
    return Config(
        **kwargs
    )


def build_config_from_name(name: str, **kwargs: Any) -> Config:
    raw_config = get_raw_config_from_name(name, **kwargs)
    calculated_config = fill_in_calculated_config(raw_config)
    return config_factory(**calculated_config)


def get_config_name_from_branch(branch: str) -> str:
    if branch == 'dev':
        return 'dev'
    return 'demo'


def get_backend_url_from_branch(branch: str) -> str:
    return f'https://igvfd-{branch}.demo.igvf.org'
